import { auth, db } from './firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Module de test pour vérifier la connexion Firebase, l'authentification anonyme
 * et la lecture/écriture dans Firestore.
 * 
 * @param phone Numéro de téléphone de test
 * @param password Mot de passe de test
 * @returns Objet d'état { success: boolean, message: string }
 */
export async function testFirebaseLogin(phone: string, password: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Début du test de connexion Firebase...");

    // 1 & 2. Vérifier la session actuelle et faire un login anonyme si nécessaire
    if (!auth.currentUser) {
      console.log("Aucune session active, tentative de login anonyme...");
      await signInAnonymously(auth);
      console.log("✅ Login anonyme réussi. UID:", auth.currentUser?.uid);
    } else {
      console.log("✅ Utilisateur déjà connecté anonymement. UID:", auth.currentUser.uid);
    }

    // 3. Vérifier l'utilisateur personnalisé dans Firestore
    // Note: On utilise le numéro de téléphone comme ID de document pour ce test
    const userRef = doc(db, 'users', phone);
    console.log(`Vérification de l'existence du document utilisateur (ID: ${phone})...`);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // 4. Création de l'utilisateur personnalisé (Test d'écriture)
      console.log("Utilisateur non trouvé. Création en cours...");
      await setDoc(userRef, {
        phone: phone,
        password: password,
        tokens: 0,
        status: 'active',
        isTestAccount: true,
        createdAt: serverTimestamp()
      });
      console.log("✅ Utilisateur créé avec succès dans Firestore.");
    } else {
      // Test de lecture réussi
      console.log("✅ Utilisateur déjà existant dans Firestore :", userDoc.data());
    }

    // 5. Retourner l'état de succès
    return { success: true, message: "Test connexion Firebase réussi avec succès" };

  } catch (error: any) {
    // 6. Gestion des erreurs et logs clairs
    console.error("❌ Erreur lors du test Firebase:", error);
    
    // Message d'erreur spécifique si l'authentification anonyme n'est pas activée
    if (error.code === 'auth/operation-not-allowed') {
      return { 
        success: false, 
        message: "L'authentification anonyme n'est pas activée dans la console Firebase. Veuillez l'activer dans Authentication > Sign-in method." 
      };
    }

    return { success: false, message: error.message || "Erreur inconnue lors du test" };
  }
}
