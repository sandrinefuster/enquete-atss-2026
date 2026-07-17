/* ==========================================================
   TEST DE CONNEXION GRIST
========================================================== */

async function testConnexionGrist(){

    const url =
        "https://grist.numerique.gouv.fr/api/docs/"
        + CONFIG.DOC_ID
        + "/tables/"
        + encodeURIComponent(CONFIG.TABLE)
        + "/records";

    const donnees = {

        records : [

            {

                fields : {

                    Sexe : "TEST",

                    Grade : "Connexion API"

                }

            }

        ]

    };

    try{

        const reponse = await fetch(url,{

            method : "POST",

            headers : {

                "Authorization" : "Bearer " + CONFIG.API_KEY,

                "Content-Type" : "application/json"

            },

            body : JSON.stringify(donnees)

        });

        if(!reponse.ok){

            throw new Error(await reponse.text());

        }

        alert("Connexion Grist réussie.");

        console.log(await reponse.json());

    }

    catch(erreur){

        console.error(erreur);

        alert("Erreur de connexion avec Grist.");

    }

}