class IPFSService {
  constructor() {
    this.apiUrl = 'http://127.0.0.1:5001/api/v0';
    this.gatewayUrl = 'http://127.0.0.1:8080/ipfs';
  }

  async testConnection() {
    try {
      console.log(' Test connexion IPFS...');
      const response = await fetch(`${this.apiUrl}/id`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('Statut réponse:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ IPFS connecté! Node ID:', data.ID);
        return true;
      } else {
        console.error('❌ Réponse IPFS non-OK:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur connnnnexion IPFS:', error.message);
      return false;
    }
  }

  async uploadImage(file) {
    console.log('📤 Début upload image...');
    
    // Test de connexion
    const isConnected = await this.testConnection();
    if (!isConnected) {
      return { 
        success: false, 
        error: "IPFS non accessible après configuration CORS. Redémarrez IPFS Desktop." 
      };
    }

    try {
      console.log('📤 Upload image vers IPFS...', file.name);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.apiUrl}/add`, {
        method: 'POST',
        body: formData
      });

      console.log('📊 Réponse upload:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur détaillée:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const cid = result.Hash;
      
      console.log('✅ Image uploadée! CID:', cid);
      
      // Épingler l'image
      await this.pinFile(cid);
      
      return {
        success: true,
        cid: cid,
        url: `${this.gatewayUrl}/${cid}`,
        gatewayUrl: `${this.gatewayUrl}/${cid}`
      };

    } catch (error) {
      console.error('❌ Erreur upload image:', error);
      return { 
        success: false, 
        error: `Upload échoué: ${error.message}` 
      };
    }
  }

  async uploadMetadata(metadata) {
    try {
      console.log('📄 Upload métadonnées...');
      
      const blob = new Blob([JSON.stringify(metadata, null, 2)], { 
        type: 'application/json' 
      });
      const file = new File([blob], 'metadata.json');
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.apiUrl}/add`, {
        method: 'POST',
        body: formData
      });

      console.log('📊 Réponse métadonnées:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const cid = result.Hash;
      
      console.log('✅ Métadonnées uploadées! CID:', cid);
      
      // Épingler
      await this.pinFile(cid);
      
      return {
        success: true,
        cid: cid,
        url: `ipfs://${cid}`,
        gatewayUrl: `${this.gatewayUrl}/${cid}`
      };

    } catch (error) {
      console.error('❌ Erreur upload métadonnées:', error);
      return { success: false, error: error.message };
    }
  }

  async pinFile(cid) {
    try {
      console.log('📌 Épinglage fichier:', cid);
      const response = await fetch(`${this.apiUrl}/pin/add?arg=${cid}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        console.log('✅ Fichier épinglé:', cid);
        return true;
      } else {
        console.warn('⚠️ Échec épinglage:', cid);
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Erreur épinglage:', error);
      return false;
    }
  }


  async createEventWithIPFS(eventData, imageFile) {
  try {
    console.log('🎪 Création événement IPFS...');

    // 1. Upload image
    console.log('🖼️ Étape 1: Upload image');
    const imageResult = await this.uploadImage(imageFile);
    if (!imageResult.success) {
      throw new Error(`Échec upload image: ${imageResult.error}`);
    }

    console.log('✅ Image uploadée CID:', imageResult.cid);

    // 2. 🔥 MÉTADONNÉES SIMPLIFIÉES - SEULEMENT IMAGE ET DESCRIPTION
    const metadata = {
      // ✅ UNIQUEMENT ces 2 champs dans IPFS
      description: eventData.description,
      image: `ipfs://${imageResult.cid}`
    };

    console.log('📄 Métadonnées simplifiées:', metadata);

    // 3. Upload métadonnées
    console.log('📄 Étape 3: Upload métadonnées');
    const metadataResult = await this.uploadMetadata(metadata);
    if (!metadataResult.success) {
      throw new Error(`Échec upload métadonnées: ${metadataResult.error}`);
    }

    console.log('🎉 Événement IPFS créé! Metadata CID:', metadataResult.cid);
    
    return {
      success: true,
      imageCID: imageResult.cid,
      metadataCID: metadataResult.cid,
      metadataURL: metadataResult.url,
      gatewayURL: metadataResult.gatewayUrl,
      imageURL: imageResult.gatewayUrl
    };

  } catch (error) {
    console.error('💥 Erreur création événement IPFS:', error);
    return { success: false, error: error.message };
  }

}

  // Vérification détaillée de l'état IPFS
  async getDetailedStatus() {
    try {
      const response = await fetch(`${this.apiUrl}/id`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        return {
          connected: false,
          error: `HTTP ${response.status} - Vérifiez qu'IPFS Desktop est démarré`
        };
      }
      
      const nodeInfo = await response.json();
      return {
        connected: true,
        nodeId: nodeInfo.ID,
        version: nodeInfo.AgentVersion,
        addresses: nodeInfo.Addresses
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }
}

export default new IPFSService();