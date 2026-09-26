/* ==========================================================
   ENQUÊTE EAFC
   SERVER.JS - VERSION 3.0
========================================================== */


/* ==========================================================
   1. MODULES
========================================================== */

const express = require("express");
require("dotenv").config();


/* ==========================================================
   2. CONFIGURATION
========================================================== */

const app = express();

const PORT = process.env.PORT || 3000;

const API_KEY = process.env.GRIST_API_KEY;
const DOC_ID = process.env.GRIST_DOC_ID;
const TABLE = process.env.GRIST_TABLE;


/* ==========================================================
   3. MIDDLEWARE
========================================================== */

app.use(express.json({ limit: "100kb" }));

app.use(express.static(__dirname));


/* ==========================================================
   4. ROUTE D'ACCUEIL
========================================================== */

app.get("/", (req, res) => {

  res.sendFile(__dirname + "/index.html");

});


/* ==========================================================
   5. ENVOI DES RÉPONSES VERS GRIST
========================================================== */

app.post("/envoyer", async (req, res) => {

      try {

    const reponses = req.body;

    /* ------------------------------------------------------
       Vérification minimale des données reçues
    ------------------------------------------------------ */

    if (
      !reponses ||
      !reponses.typeStructure ||
      !reponses.departement ||
      !reponses.genre ||
      !reponses.filiere ||
      !reponses.corps ||
      !reponses.ancienneteCorps ||
      !reponses.fonction ||
      !reponses.ancienneteFonction ||
      !Array.isArray(reponses.domaines) ||
      !Array.isArray(reponses.situations) ||
      reponses.situations.length < 1 ||
      reponses.situations.length > 5 ||
      !Array.isArray(reponses.priorites) ||
      reponses.priorites.length !== reponses.situations.length ||
      !["Oui", "Non"].includes(reponses.formationDeuxAns) ||
      !Array.isArray(reponses.leviersEngagement) ||
      reponses.leviersEngagement.length < 1
    ) {

      return res.status(400).json({
        succes: false,
        message: "Données incomplètes."
      });
    }


    /* ------------------------------------------------------
       Vérification de la configuration Grist
    ------------------------------------------------------ */

    if (!API_KEY || !DOC_ID || !TABLE) {

      console.error(
        "Configuration Grist incomplète."
      );

      return res.status(500).json({
        succes: false,
        message: "Configuration du serveur incomplète."
      });
    }


    /* ------------------------------------------------------
       Préparation des données Grist
    ------------------------------------------------------ */

    const donneesGrist = {

      records: [

        {

fields: {

  Date_reponse: new Date().toISOString(),

  Type_structure:
    reponses.typeStructure || "",

  Type_structure_autre:
    reponses.typeStructureAutre || "",

  Departement2:
    reponses.departement || "",

  Genre:
    reponses.genre || "",

  Filiere:
    reponses.filiere || "",

  Corps:
    reponses.corps || "",

  Corps_autre:
    reponses.corpsAutre || "",

  Anciennete_corps:
    reponses.ancienneteCorps || "",

  Fonction2:
    reponses.fonction || "",

  Fonction_precision:
    reponses.fonctionPrecision || "",

  Anciennete_fonction:
    reponses.ancienneteFonction || "",

  Domaines:
    reponses.domaines.join(" | "),

  Situations:
    reponses.situations.join(" | "),

  Priorites:
    reponses.priorites
      .map(
        (situation, index) =>
          `${index + 1}. ${situation}`
      )
      .join(" | "),

  Formations_deux_ans:
    reponses.formationDeuxAns || "",

  Leviers_engagement:
    reponses.leviersEngagement.join(" | "),

  Levier_autre:
    reponses.levierAutre || "",

  Version:
    reponses.version || "3.0"

}

        }

      ]

    };


    /* ------------------------------------------------------
       Envoi à Grist
    ------------------------------------------------------ */

    const reponseGrist = await fetch(

      `https://grist.numerique.gouv.fr/api/docs/${DOC_ID}/tables/${encodeURIComponent(TABLE)}/records`,

      {

        method: "POST",

        headers: {

          Authorization: `Bearer ${API_KEY}`,

          "Content-Type": "application/json"

        },

        body: JSON.stringify(donneesGrist)

      }

    );


    /* ------------------------------------------------------
       Gestion d'une erreur Grist
    ------------------------------------------------------ */

    if (!reponseGrist.ok) {

      const erreurGrist =
        await reponseGrist.text();

      console.error(
        "Erreur Grist :",
        reponseGrist.status,
        erreurGrist
      );

      return res.status(502).json({

        succes: false,

        message:
          "Les réponses n'ont pas pu être enregistrées."

      });

    }


    /* ------------------------------------------------------
       Succès
    ------------------------------------------------------ */

    return res.json({
      succes: true
    });

  }

  catch (erreur) {

    console.error(
      "Erreur lors de l'enregistrement :",
      erreur
    );

    return res.status(500).json({

      succes: false,

      message:
        "Une erreur est survenue lors de l'enregistrement."

    });

  }

});


/* ==========================================================
   6. DÉMARRAGE DU SERVEUR
========================================================== */

app.listen(PORT, () => {

  console.log(
    `Serveur EAFC démarré sur le port ${PORT}`
  );

});