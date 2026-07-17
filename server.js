/* ==========================================================
   BAROMÈTRE EAFC
   SERVER.JS - VERSION 1.1 - TEST
========================================================== */

/* ==========================================================
   1. MODULES
========================================================== */

const express = require("express");
const cors = require("cors");
const fetch = global.fetch;
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

app.use(cors());

app.use(express.json());

app.use(express.static(__dirname));

/* ==========================================================
   4. ROUTES
========================================================== */

/* ----------------------------------------------------------
   Accueil
---------------------------------------------------------- */

app.get("/", (req, res) => {

    res.sendFile(__dirname + "/index.html");

});

/* ----------------------------------------------------------
   Envoi des réponses vers Grist
---------------------------------------------------------- */

app.post("/envoyer", async (req,res)=>{

    try{

        const reponses = req.body;

        const donneesGrist = {

    records:[

        {

            fields: {

    Etablissement: reponses.etablissement,

    Commune: reponses.commune,

    UAI: reponses.uai,

    Genre: reponses.genre,

    Anciennete: reponses.anciennete,

    Grade: reponses.grade,

    Fonction: reponses.fonction,

    Domaines: reponses.domaines.join(" | "),

    Situations: reponses.situations.join(" | "),

    Modalites: reponses.modalites.join(" | "),

    Methodes: reponses.methodes.join(" | "),

    Mail: reponses.mail,

    Version: "2.0"

}

        }

    ]

};

console.log("");
console.log("========== DONNÉES POUR GRIST ==========");
console.dir(donneesGrist,{depth:null});
console.log("========================================");
console.log("");

        console.log("");
        console.log("========== NOUVELLE REPONSE ==========");

        console.log(reponses);

        console.log("======================================");
        console.log("");

        console.log("DOC_ID :", DOC_ID);
        console.log("TABLE  :", TABLE);

const reponseGrist = await fetch(

    `https://grist.numerique.gouv.fr/api/docs/${DOC_ID}/tables/${encodeURIComponent(TABLE)}/records`,

    {

        method: "POST",

        headers: {

            "Authorization": `Bearer ${API_KEY}`,

            "Content-Type": "application/json"

        },

        body: JSON.stringify(donneesGrist)

    }

);

if(!reponseGrist.ok){

      console.log("===== ERREUR GRIST =====");

    console.log("Statut :", reponseGrist.status);

    console.log("StatusText :", reponseGrist.statusText);

    const erreurGrist = await reponseGrist.text();

console.log("Réponse :", erreurGrist);

    console.log("========================");

    return res.status(500).json({

        succes:false,

        message:"Erreur Grist"

    });

}

res.json({

    succes:true

});         

    }

    catch(erreur){

        console.error(erreur);

        res.status(500).json({

            succes:false,

            message:erreur.message

        });

    }

});

/* ==========================================================
   5. DÉMARRAGE DU SERVEUR
========================================================== */

app.get("/tables", async (req, res) => {

    const reponse = await fetch(

        `https://grist.numerique.gouv.fr/api/docs/${DOC_ID}/tables`,

        {

            headers: {

                Authorization: `Bearer ${API_KEY}`

            }

        }

    );

    const resultat = await reponse.json();

    res.json(resultat);

});

app.listen(PORT, () => {

    console.log("");

    console.log("======================================");
    console.log(" BAROMÈTRE EAFC");
    console.log(" SERVER.JS VERSION 1.0");
    console.log("======================================");

    console.log("");

    console.log("Document Grist :", DOC_ID);
    console.log("Table          :", TABLE);
    console.log("Configuration  :", API_KEY ? "OK" : "ERREUR");

    console.log("");

    console.log("Serveur démarré");
    console.log("http://localhost:" + PORT);

    console.log("");

});