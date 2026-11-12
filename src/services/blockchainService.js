import { ethers } from 'ethers';
import './ipfsService';

const CONTRACT_ADDRESSES = {
ticketNFT: "adress1",
  eventManager: "adress2", 
  marketplace: "adress3",
};

// Import des ABI
import TicketNFTABI from '../contracts/TicketNFT.json';
import EventManagerABI from '../contracts/EventManager.json';
import MarketplaceABI from '../contracts/Marketplace.json';

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.isConnected = false;
    this.currentAddress = '';
  }

  async connectWallet() {
    if (!window.ethereum) {
      throw new Error("Veuillez installer MetaMask!");
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.currentAddress = await this.signer.getAddress();
      
      await this.initializeContracts();
      
      this.isConnected = true;
      
      window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
      window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
      
      return this.currentAddress;
    } catch (error) {
      console.error('Erreur connexion wallet:', error);
      throw error;
    }
  }

  async initializeContracts() {
    try {
      this.contracts.ticketNFT = new ethers.Contract(
        CONTRACT_ADDRESSES.ticketNFT,
        TicketNFTABI.abi,
        this.signer
      );

      this.contracts.eventManager = new ethers.Contract(
        CONTRACT_ADDRESSES.eventManager,
        EventManagerABI.abi,
        this.signer
      );

      this.contracts.marketplace = new ethers.Contract(
        CONTRACT_ADDRESSES.marketplace,
        MarketplaceABI.abi,
        this.signer
      );


      await Promise.all([
        this.contracts.ticketNFT.name(),
        this.contracts.eventManager.owner(),
        this.contracts.marketplace.ticketContract(),
        this.contracts.exchange.ticketContract()
      ]);

    } catch (error) {
      console.error('Erreur initialisation contrats:', error);
      throw new Error('Impossible de se connecter aux contrats. Vérifiez les adresses et le réseau.');
    }
  }

  handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      this.isConnected = false;
      this.currentAddress = '';
      window.location.reload();
    } else if (accounts[0] !== this.currentAddress) {
      this.currentAddress = accounts[0];
      window.location.reload();
    }
  }

  handleChainChanged(chainId) {
    window.location.reload();
  }

  async getCurrentAddress() {
    return this.currentAddress;
  }

  async getNetworkInfo() {
    if (!this.provider) return null;
    const network = await this.provider.getNetwork();
    return {
      name: network.name,
      chainId: network.chainId,
      isTestnet: network.chainId === 31337 || network.chainId === 1337
    };
  }

  // === FONCTIONS EVENT MANAGER ===
  async createEvent(eventData) {
    try {
      console.log('🚀 Appel du contrat avec CID IPFS:', eventData.ipfsMetadataCID);
      
      const tx = await this.contracts.eventManager.createEvent(
        eventData.title,
        eventData.ipfsMetadataCID,
        eventData.location,
        Math.floor(new Date(eventData.date).getTime() / 1000),
        eventData.royaltyBps || 500,
        eventData.maxResalePriceWei || ethers.parseEther('10'),
        eventData.resaleAllowed !== false
      );
      
      const receipt = await tx.wait();
      const eventId = this.extractEventIdFromReceipt(receipt);
      
      return { success: true, receipt, eventId };
    } catch (error) {
      console.error('Erreur création événement:', error);
      throw this.parseError(error);
    }
  }

  async addCategoryToEvent(eventId, categoryName, priceWei, quantity) {
    try {
      const tx = await this.contracts.eventManager.addCategory(
        eventId,
        categoryName,
        priceWei,
        quantity
      );
      return await tx.wait();
    } catch (error) {
      console.error('Erreur ajout catégorie:', error);
      throw this.parseError(error);
    }
  }

  //  FONCTION ACHAT 
  async buyTicket(eventId, categoryIdx, priceWei) {
    try {
      console.log('🔍 DEBUG ACHAT - Début');
      
      console.log('Event ID:', eventId);
      console.log('Category Index:', categoryIdx);
      console.log('Prix Wei fourni:', priceWei.toString());

      if (!this.signer) {
        throw new Error('❌ Wallet non connecté');
      }

      const eventDetails = await this.getEventDetails(eventId);
      console.log('Événement trouvé:', eventDetails.title);
      
      if (!eventDetails.exists) {
        throw new Error('❌ Événement non trouvé');
      }

      if (new Date(eventDetails.date) < new Date()) {
        throw new Error('❌ Cet événement est déjà passé');
      }

      if (categoryIdx >= eventDetails.categories.length) {
        throw new Error('❌ Catégorie non trouvée');
      }

      const category = eventDetails.categories[categoryIdx];
      console.log('Catégorie:', category.name);
      console.log('Prix catégorie:', category.priceWei.toString());
      console.log('Tickets disponibles:', category.available);

      if (category.available <= 0) {
        throw new Error('❌ Plus de tickets disponibles dans cette catégorie');
      }

      const priceToPay = BigInt(category.priceWei.toString());
      const priceProvided = BigInt(priceWei.toString());
      
      console.log('Prix à payer (BigInt):', priceToPay.toString());
      console.log('Prix fourni (BigInt):', priceProvided.toString());

      if (priceProvided < priceToPay) {
        throw new Error(`❌ Prix insuffisant. Requis: ${this.formatEther(priceToPay)} ETH`);
      }

      const balance = await this.provider.getBalance(this.currentAddress);
      console.log('💰 Solde utilisateur:', this.formatEther(balance), 'ETH');
      
      if (balance < priceToPay) {
        throw new Error(`❌ Solde insuffisant! Vous avez ${this.formatEther(balance)} ETH mais besoin de ${this.formatEther(priceToPay)} ETH`);
      }

      console.log('✅ Toutes les vérifications OK - Envoi transaction...');

      const tx = await this.contracts.eventManager.buyTicketPrimary(
        eventId,
        categoryIdx,
        { 
          value: priceToPay,
          gasLimit: 500000
        }
      );
      
      console.log('📤 Transaction envoyée:', tx.hash);
      console.log('⏳ Attente de confirmation...');
      
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmée');

      const tokenId = this.extractTokenIdFromReceipt(receipt);
      console.log('🎉 Ticket créé ID:', tokenId);
      
      return { success: true, receipt, tokenId };

    } catch (error) {
      console.error('❌ ERREUR COMPLÈTE:', error);
      
      if (error.message && error.message.includes('user rejected')) {
        throw new Error('Transaction annulée par l\'utilisateur');
      }
      
      throw this.parseError(error);
    }
  }

  async getEventCategories(eventId) {
    try {
      const event = await this.contracts.eventManager.getEventBasics(eventId);
      const categoryCount = Number(event[8]);
      
      console.log(`🔍 Event ${eventId} a ${categoryCount} catégories`);
      
      //  Vérification 
      if (categoryCount === 0 || isNaN(categoryCount) || categoryCount > 50) {
        console.log('ℹ️ Aucune catégorie ou nombre invalide pour event', eventId);
        return [];
      }
      
      const categories = [];
      
      // 🔥 CORRECTION: Boucle avec gestion d'erreur individuelle
      for (let i = 0; i < categoryCount; i++) {
        try {
          const category = await this.contracts.eventManager.getCategory(eventId, i);
          
          if (category && category.length >= 4) {
            categories.push({
              index: i,
              name: category[0] || 'Sans nom',
              priceWei: category[1] || '0',
              priceEth: this.formatEther(category[1] || '0'),
              quantity: Number(category[2] || 0),
              minted: Number(category[3] || 0),
              available: Math.max(0, Number(category[2] || 0) - Number(category[3] || 0))
            });
          } else {
            console.warn(`⚠️ Catégorie ${i} invalide pour event ${eventId}:`, category);
          }
        } catch (error) {
          console.warn(`❌ Erreur catégorie ${i} pour event ${eventId}:`, error.message);
        }
      }
      
      console.log(`✅ ${categories.length} catégories chargées pour event ${eventId}`);
      return categories;
      
    } catch (error) {
      console.error('❌ Erreur générale catégories pour event', eventId, ':', error);
      return [];
    }
  }

  async getTotalTickets(eventId) {
    try {
      return await this.contracts.eventManager.getTotalTickets(eventId);
    } catch (error) {
      console.warn('❌ Erreur total tickets pour event', eventId, ':', error.message);
      return 0;
    }
  }

  async getAvailableTickets(eventId) {
    try {
      return await this.contracts.eventManager.getAvailableTickets(eventId);
    } catch (error) {
      console.warn('❌ Erreur tickets disponibles pour event', eventId, ':', error.message);
      return 0;
    }
  }

  async getEvents(filter = 'all') {
    try {
      let events = [];
      
      if (filter === 'my') {
        console.log('👤 Chargement de mes événements...');
        events = await this.getUserEvents();
      } else {
        console.log('📅 Chargement de tous les événements...');
        events = await this.getAllEvents();
      }
      
      const validEvents = events.filter(event => 
        event.exists && 
        event.title && 
        event.title.length > 0
      );
      
      console.log(`✅ ${validEvents.length} événements valides sur ${events.length} au total`);
      return validEvents;
      
    } catch (error) {
      console.error('❌ Erreur getEvents:', error);
      return [];
    }
  }

  async getUserEvents() {
    try {
      const address = await this.getCurrentAddress();
      const eventIds = await this.contracts.eventManager.getUserEvents(address);
      
      console.log('📋 IDs événements utilisateur:', eventIds);
      
      const events = [];
      for (const eventId of eventIds) {
        try {
          const eventDetails = await this.getEventDetails(Number(eventId));
          if (eventDetails.exists) {
            events.push(eventDetails);
          }
        } catch (error) {
          console.warn(`⚠️ Erreur chargement événement ${eventId}:`, error.message);
        }
      }
      
      return events;
    } catch (error) {
      console.error('❌ Erreur événements utilisateur:', error);
      return [];
    }
  }

  async getAllEvents(limit = 50) {
    try {
      const eventIds = await this.contracts.eventManager.getAllEvents(1, limit);
      
      console.log('📋 IDs tous les événements:', eventIds);
      
      const events = [];
      for (const eventId of eventIds) {
        try {
          const eventDetails = await this.getEventDetails(Number(eventId));
          if (eventDetails.exists) {
            events.push(eventDetails);
          }
        } catch (error) {
          console.warn(`⚠️ Erreur chargement événement ${eventId}:`, error.message);
        }
      }
      
      return events;
    } catch (error) {
      console.error('❌ Erreur tous les événements:', error);
      return [];
    }
  }

  // === FONCTIONS MARKETPLACE ===
  async isTicketListed(tokenId) {
    try {
      const listing = await this.getListing(tokenId);
      return listing.exists;
    } catch (error) {
      return false;
    }
  }

  async getMyListings() {
    try {
      const allListings = await this.getAllListings();
      const myAddress = await this.getCurrentAddress();
      return allListings.filter(listing => 
        listing.seller.toLowerCase() === myAddress.toLowerCase()
      );
    } catch (error) {
      console.error('Erreur mes listings:', error);
      return [];
    }
  }

  async getAvailableTicketsForSale() {
    try {
      const [userTickets, allListings] = await Promise.all([
        this.getUserTickets(),
        this.getAllListings()
      ]);

      const myAddress = await this.getCurrentAddress();
      const listedTokenIds = new Set(
        allListings
          .filter(listing => listing.seller.toLowerCase() === myAddress.toLowerCase())
          .map(listing => listing.tokenId)
      );

      return userTickets.filter(ticket => 
        !ticket.used && 
        new Date(ticket.eventDate) > new Date() &&
        !listedTokenIds.has(ticket.tokenId)
      );
    } catch (error) {
      console.error('Erreur tickets disponibles:', error);
      return [];
    }
  }

  async listToken(tokenId, priceWei) {
    try {
      const isAlreadyListed = await this.isTicketListed(tokenId);
      if (isAlreadyListed) {
        throw new Error('Ce ticket est déjà en vente');
      }

      const isApproved = await this.isTicketApprovedForMarketplace(tokenId);
      if (!isApproved) {
        const approveTx = await this.contracts.ticketNFT.approve(
          CONTRACT_ADDRESSES.marketplace, 
          tokenId
        );
        await approveTx.wait();
      }
      
      const tx = await this.contracts.marketplace.listToken(tokenId, priceWei);
      return await tx.wait();
    } catch (error) {
      console.error('Erreur mise en vente:', error);
      throw this.parseError(error);
    }
  }

  async buyToken(tokenId, priceWei) {
    try {
      const listing = await this.getListing(tokenId);
      if (!listing.exists) {
        throw new Error('Ce ticket n\'est plus en vente');
      }

      const userAddress = await this.getCurrentAddress();
      if (listing.seller.toLowerCase() === userAddress.toLowerCase()) {
        throw new Error('Vous ne pouvez pas acheter votre propre ticket');
      }

      const tx = await this.contracts.marketplace.buy(
        tokenId, 
        { 
          value: priceWei,
          gasLimit: 500000
        }
      );
      
      return await tx.wait();
      
    } catch (error) {
      console.error('Erreur achat marketplace:', error);
      throw this.parseError(error);
    }
  }      

  async cancelListing(tokenId) {
    try {
      const listing = await this.getListing(tokenId);
      const userAddress = await this.getCurrentAddress();
      
      if (!listing.exists) {
        throw new Error('Ce ticket n\'est pas en vente');
      }

      if (listing.seller.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error('Vous ne pouvez annuler que vos propres ventes');
      }

      const tx = await this.contracts.marketplace.cancelListing(tokenId);
      return await tx.wait();
    } catch (error) {
      console.error('Erreur annulation vente:', error);
      throw this.parseError(error);
    }
  }

  async getListing(tokenId) {
    try {
      const listing = await this.contracts.marketplace.getListing(tokenId);
      return {
        seller: listing[0],
        priceWei: listing[1],
        priceEth: this.formatEther(listing[1]),
        exists: listing[2]
      };
    } catch (error) {
      console.error('Erreur listing:', error);
      return { exists: false };
    }
  }

  async getAllListings() {
    try {
      const activeListings = [];
      
      for (let tokenId = 1; tokenId <= 1000; tokenId++) {
        try {
          const listing = await this.getListing(tokenId);
          
          if (listing.exists) {
            const ticketData = await this.getTicketData(tokenId);
            
            if (ticketData) {
              activeListings.push({
                tokenId,
                ...listing,
                ...ticketData
              });
            }
          }
        } catch (error) {
          continue;
        }
      }
      
      console.log(`✅ ${activeListings.length} VENTES ACTIVES récupérées`);
      return activeListings;
    } catch (error) {
      console.error('❌ Erreur:', error);
      return [];
    }
  }

  // === FONCTIONS DE LECTURE TICKETS ===
  async getUserTickets() {
    try {
      const address = await this.getCurrentAddress();
      const balance = await this.contracts.ticketNFT.balanceOf(address);
      const tickets = [];

      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await this.contracts.ticketNFT.tokenOfOwnerByIndex(address, i);
          const tokenIdNumber = Number(tokenId);
          
          const [ticketData, isUsed] = await Promise.all([
            this.contracts.ticketNFT.ticketData(tokenIdNumber),
            this.contracts.ticketNFT.isUsed(tokenIdNumber)
          ]);

          const eventDetails = await this.getEventDetails(Number(ticketData.eventId));

          tickets.push({
            tokenId: tokenIdNumber,
            eventId: Number(ticketData.eventId),
            ticketType: Number(ticketData.ticketType),
            used: isUsed,
            eventTitle: eventDetails?.title || `Événement #${ticketData.eventId}`,
            eventImage: eventDetails?.imageUrl,
            eventDate: eventDetails?.date,
            eventLocation: eventDetails?.location,
            maxResalePriceWei: eventDetails?.maxResalePriceWei,
            resaleAllowed: eventDetails?.resaleAllowed !== false
          });
        } catch (error) {
          console.error(`Erreur chargement ticket ${i}:`, error);
        }
      }

      return tickets;
    } catch (error) {
      console.error('Erreur récupération tickets:', error);
      return [];
    }
  }

  async getTicketData(tokenId) {
    try {
      let owner;
      try {
        owner = await this.contracts.ticketNFT.ownerOf(tokenId);
      } catch (error) {
        console.error(`Ticket #${tokenId} n'existe pas`);
        return null;
      }
      
      if (owner === ethers.ZeroAddress) {
        return null;
      }
      
      const [ticketData, isUsed] = await Promise.all([
        this.contracts.ticketNFT.ticketData(tokenId),
        this.contracts.ticketNFT.isUsed(tokenId)
      ]);
      
      const eventDetails = await this.getEventDetails(Number(ticketData.eventId));

      return {
        eventId: Number(ticketData.eventId),
        ticketType: Number(ticketData.ticketType),
        used: isUsed,
        eventTitle: eventDetails?.title,
        eventImage: eventDetails?.imageUrl,
        eventDate: eventDetails?.date,
        eventLocation: eventDetails?.location,
        maxResalePriceWei: eventDetails?.maxResalePriceWei,
        resaleAllowed: eventDetails?.resaleAllowed !== false
      };
    } catch (error) {
      console.error(`Erreur données ticket #${tokenId}:`, error);
      return null;
    }
  }

  // === FONCTIONS UTILITAIRES ===
  async isTicketApprovedForMarketplace(tokenId) {
    try {
      const approvedAddress = await this.contracts.ticketNFT.getApproved(tokenId);
      return approvedAddress.toLowerCase() === CONTRACT_ADDRESSES.marketplace.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  async isTicketApprovedForExchange(tokenId) {
    try {
      const approvedAddress = await this.contracts.ticketNFT.getApproved(tokenId);
      return approvedAddress.toLowerCase() === CONTRACT_ADDRESSES.exchange.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  async tokenExists(tokenId) {
    try {
      const owner = await this.contracts.ticketNFT.ownerOf(tokenId);
      return owner !== ethers.ZeroAddress;
    } catch (error) {
      return false;
    }
  }

  async getBalance() {
    if (!this.signer) return '0';
    const balance = await this.provider.getBalance(this.currentAddress);
    return this.formatEther(balance);
  }

  // === EXTRACTION D'ÉVÉNEMENTS DES RECEIPTS ===
  extractEventIdFromReceipt(receipt) {
    const eventCreatedLog = receipt.logs.find(log => 
      log.topics[0] === ethers.id('EventCreated(uint256,address,string,string)')
    );
    if (eventCreatedLog) {
      return parseInt(eventCreatedLog.topics[1]);
    }
    return null;
  }

  extractTokenIdFromReceipt(receipt) {
    const ticketIssuedLog = receipt.logs.find(log => 
      log.topics[0] === ethers.id('TicketIssued(uint256,uint256,address,uint256)')
    );
    if (ticketIssuedLog) {
      return parseInt(ticketIssuedLog.topics[2]);
    }
    return null;
  }

  extractProposalIdFromReceipt(receipt) {
    const swapProposedLog = receipt.logs.find(log => 
      log.topics[0] === ethers.id('SwapProposed(uint256,address,uint256,address,uint256)')
    );
    if (swapProposedLog) {
      return parseInt(swapProposedLog.topics[1]);
    }
    return null;
  }

  // === UTILITAIRES ===
  parseEther(amount) {
    return ethers.parseEther(amount.toString());
  }

  formatEther(amount) {
    return ethers.formatEther(amount);
  }

  formatPrice(priceWei) {
    const priceEth = this.formatEther(priceWei);
    return `${parseFloat(priceEth).toFixed(4)} ETH`;
  }

  formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusText(status) {
    switch (Number(status)) {
      case 0: return 'En attente';
      case 1: return 'Accepté';
      case 2: return 'Rejeté';
      case 3: return 'Annulé';
      default: return 'Inconnu';
    }
  }

  parseError(error) {
    if (error.info && error.info.error) {
      return new Error(error.info.error.message);
    }
    if (error.reason) {
      return new Error(error.reason);
    }
    if (error.message) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('user rejected')) {
        return new Error('Transaction annulée par l\'utilisateur');
      }
      if (errorMessage.includes('insufficient funds')) {
        return new Error('Fonds insuffisants pour cette transaction');
      }
      if (errorMessage.includes('nonce too low')) {
        return new Error('Erreur de transaction, veuillez réessayer');
      }
      if (errorMessage.includes('already listed')) {
        return new Error('Ce ticket est déjà en vente');
      }
      if (errorMessage.includes('not owner')) {
        return new Error('Vous ne possédez pas ce ticket');
      }
      return new Error(error.message);
    }
    return new Error('Erreur inconnue lors de la transaction');
  }

  disconnect() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.isConnected = false;
    this.currentAddress = '';
    
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }

  async checkNetwork() {
    try {
      const network = await this.getNetworkInfo();
      if (!network.isTestnet) {
        console.warn('Vous n\'êtes pas connecté à un réseau de test');
      }
      return network;
    } catch (error) {
      console.error('Erreur vérification réseau:', error);
      return null;
    }
  }

  async estimateGas(method, ...args) {
    try {
      const gasEstimate = await method.estimateGas(...args);
      return {
        gasLimit: gasEstimate,
        gasEstimate: this.formatEther(await this.provider.getFeeData().then(data => data.gasPrice * gasEstimate))
      };
    } catch (error) {
      console.error('Erreur estimation gas:', error);
      return null;
    }
  } 

  // 🔥 FONCTION UNIQUE POUR IMAGES IPFS
   getEventImageUrl (event) {
  if (!event) return `https://picsum.photos/400/200?random=${Math.random()}`;
  
  // 1. Essayer IPFS metadata d'abord
  if (event.ipfsMetadata?.rawData?.image) {
    const ipfsImage = event.ipfsMetadata.rawData.image;
    
    if (ipfsImage.startsWith('ipfs://')) {
      const imageCID = ipfsImage.replace('ipfs://', '');
      return `http://127.0.0.1:8080/ipfs/${imageCID}`;
    }
    
    // Si c'est déjà une URL HTTP
    if (ipfsImage.startsWith('http')) {
      return ipfsImage;
    }
  }

  // 2. Essayer imageUrl direct
  if (event.imageUrl) {
    return event.imageUrl;
  }

  // 3. Fallback SÛR
  return `https://picsum.photos/400/200?random=${event.eventId || Math.random()}`;
}

async getTicketHistory(tokenId) {
    try {
      return await this.contracts.ticketNFT.getHistory(tokenId);
    } catch (error) {
      console.error('Erreur historique ticket:', error);
      return [];
    }
  }


  async getEventDetails(eventId) {
  try {
    const event = await this.contracts.eventManager.getEventBasics(eventId);
    
    console.log('🔍 DEBUG Event brut pour ID', eventId, ':', event);
    
    let ipfsMetadata = null;
    const ipfsCID = event[1];
    
    console.log('📁 CID IPFS pour event', eventId, ':', ipfsCID);
    
    // 🔥 CHARGEMENT IPFS POUR DESCRIPTION ET IMAGE SEULEMENT
    if (ipfsCID && ipfsCID.length > 0 && ipfsCID !== '' && ipfsCID !== '0') {
      try {
        const gatewayUrl = `http://127.0.0.1:8080/ipfs/${ipfsCID}`;
        console.log('🌐 Tentative de chargement IPFS:', gatewayUrl);
        
        const response = await fetch(gatewayUrl);
        if (response.ok) {
          const rawData = await response.json();
          ipfsMetadata = {
            cid: ipfsCID,
            gatewayUrl: gatewayUrl,
            rawData: rawData
          };
          console.log('✅ Métadonnées IPFS chargées pour event', eventId);
        } else {
          console.warn('⚠️ IPFS non accessible - HTTP:', response.status);
        }
      } catch (ipfsError) {
        console.warn('❌ Erreur chargement IPFS:', ipfsError.message);
      }
    }

    // Récupération des catégories
    let categories = [];
    try {
      categories = await this.getEventCategories(eventId);
    } catch (categoryError) {
      console.warn('⚠️ Erreur catégories pour event', eventId, ':', categoryError.message);
    }

    const totalTickets = await this.getTotalTickets(eventId);
    const availableTickets = await this.getAvailableTickets(eventId);
    
    // 🔥 STRUCTURE FINALE AVEC DONNÉES BLOCKCHAIN + IPFS
    return {
      eventId: eventId,
      // ✅ DONNÉES BLOCKCHAIN
      title: event[0],
      location: event[2],
      date: new Date(Number(event[3]) * 1000),
      organizer: event[4],
      royaltyBps: Number(event[5]),
      maxResalePriceWei: event[6],
      resaleAllowed: event[7],
      categoryCount: Number(event[8]),
      categories: categories,
      totalTickets: Number(totalTickets),
      availableTickets: Number(availableTickets),
      exists: true,
      
      // ✅ DONNÉES IPFS (SEULEMENT description et image)
      description: ipfsMetadata?.rawData?.description || 'Aucune description disponible',
      imageUrl: this.getEventImageUrlFromIPFS(ipfsMetadata),
      ipfsMetadata: ipfsMetadata
    };
  } catch (error) {
    console.error('❌ Erreur détails événement pour ID', eventId, ':', error);
    return { exists: false };
  }
}

// 🔥 FONCTION POUR IMAGE IPFS
getEventImageUrlFromIPFS(ipfsMetadata) {
  if (!ipfsMetadata) return `https://picsum.photos/400/200?random=${Math.random()}`;
  
  // Récupère l'image depuis les métadonnées IPFS
  if (ipfsMetadata.rawData?.image) {
    const ipfsImage = ipfsMetadata.rawData.image;
    
    if (ipfsImage.startsWith('ipfs://')) {
      const imageCID = ipfsImage.replace('ipfs://', '');
      return `http://127.0.0.1:8080/ipfs/${imageCID}`;
    }
    
    if (ipfsImage.startsWith('http')) {
      return ipfsImage;
    }
  }

  return `https://picsum.photos/400/200?random=${Math.random()}`;
}

}

export default new BlockchainService();