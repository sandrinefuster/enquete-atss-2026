/* ==========================================================
   SCRIPT 1A-1
   INITIALISATION DE L'APPLICATION
   ========================================================== */


/* ==========================================================
   VARIABLES GLOBALES
========================================================== */

let pageCourante = 1;

const nombrePages = 4;

/* ==========================================================
   LISTE DES ÉTABLISSEMENTS
========================================================== */

let etablissements = [];

let etablissementsFiltres = [];

let etablissementSelectionne = null;

/* ==========================================================
   OBJET CONTENANT LES RÉPONSES
   (sera envoyé plus tard dans Grist)
========================================================== */

const reponses = {

    etablissement: "",

    commune: "",

uai: "",

    genre: "",

    anciennete: "",

    grade: "",

    fonction: "",

    domaines: [],

    situations: [],

    classement: [],

    modalites: [],

    methodes: [],

    mail: ""

};


/* ==========================================================
   RÉCUPÉRATION DES ÉLÉMENTS HTML
========================================================== */

const progressBar = document.getElementById("progressBar");

const pages = document.querySelectorAll(".page");

const boutonCommencer = document.getElementById("btnCommencer");

const boutonVersPage3 = document.getElementById("versPage3");


/* ==========================================================
   FONCTION
   Masquer toutes les pages
========================================================== */

function masquerToutesLesPages(){

    pages.forEach(function(page){

        page.classList.remove("active");

    });

}


/* ==========================================================
   FONCTION
   Afficher une page
========================================================== */

function afficherPage(numero){

    masquerToutesLesPages();

    document
        .getElementById("page"+numero)
        .classList
        .add("active");

}


/* ==========================================================
   FONCTION
   Mettre à jour la barre de progression
========================================================== */

function mettreAJourProgression(){

    const pourcentage = (pageCourante / nombrePages) * 100;

    progressBar.style.width = pourcentage + "%";

    progressBar.innerHTML =
        "Étape " +
        pageCourante +
        " / " +
        nombrePages;

}


/* ==========================================================
   INITIALISATION
========================================================== */

allerPage(1);

mettreAJourProgression();

/* ==========================================================
   SCRIPT 1A-2
   NAVIGATION ENTRE LES PAGES
========================================================== */

/* ==========================================================
   BOUTON COMMENCER
========================================================== */

if(boutonCommencer){

    boutonCommencer.addEventListener("click",function(){

        allerPage(2);

    });

}


/* ==========================================================
   BOUTON SUIVANT
========================================================== */

if(boutonVersPage3){

    boutonVersPage3.addEventListener("click",function(){

        enregistrerProfil();

        if(!etablissementSelectionne){

    alert(
        "Veuillez sélectionner un établissement dans la liste proposée."
    );

    return;

}

        if(!profilValide()){

            alert(
                "Veuillez compléter tous les champs obligatoires."
            );

            return;

        }

        allerPage(3);

    });

}

/* ==========================================================
   BOUTONS PAGE 3
========================================================== */

const retourPage2 = document.getElementById("retourPage2");

retourPage2.addEventListener("click",function(){

    allerPage(2);

});

const versPage4 = document.getElementById("versPage4");

versPage4.addEventListener("click",function(){

    if(reponses.domaines.length===0){

        alert(
            "Sélectionnez au moins un domaine de formation."
        );

        return;

    }

    if(reponses.situations.length===0){

        alert(
            "Sélectionnez au moins une situation professionnelle."
        );

        return;

    }

    afficherPriorites();

    allerPage(4);

});

/* ==========================================================
   SCRIPT 1A-3
   VALIDATION ET SAUVEGARDE AUTOMATIQUE
========================================================== */

/* ==========================================================
   ENREGISTRER LES DONNÉES
========================================================== */

function enregistrerProfil(){

    reponses.etablissement =
    etablissementSelectionne.Nom_etablissement;

reponses.commune =
    etablissementSelectionne.Nom_commune;

reponses.uai =
    etablissementSelectionne.Identifiant_de_l_etablissement;

    reponses.genre =
        document.getElementById("genre").value;

    reponses.anciennete =
        document.getElementById("anciennete").value;

    reponses.grade =
        document.getElementById("grade").value;

    reponses.fonction =
        document.getElementById("fonction").value;

    

}


/* ==========================================================
   VALIDATION
========================================================== */

function profilValide(){

    if(reponses.etablissement==="") return false;

    if(reponses.genre==="") return false;

    if(reponses.anciennete==="") return false;

    if(reponses.grade==="") return false;

    if(reponses.fonction==="") return false;

    return true;

}

/* ==========================================================
   SCRIPT 2A
   DOMAINES DE FORMATION (GÉNÉRATION DYNAMIQUE)
========================================================== */

/* ==========================================================
   DOMAINE SELECTIONNÉS
========================================================== */

function estSelectionne(domaineId){

    return reponses.domaines.includes(domaineId);

}


/* ==========================================================
   SELECTION / DESELECTION
========================================================== */

function toggleDomaine(domaineId){

    const index = reponses.domaines.indexOf(domaineId);

    if(index === -1){

        reponses.domaines.push(domaineId);

    } else {

        reponses.domaines.splice(index,1);

    }

    
    afficherDomaines();

    afficherSituations();

}


/* ==========================================================
   RENDU DES DOMAINES
========================================================== */

function afficherDomaines(){

    const zone = document.getElementById("zoneDomaines");

    if(!zone) return;

    zone.innerHTML = "";

    const ligne = document.createElement("div");

    ligne.className = "ligne-domaines";

    questionnaire.forEach(function(domaine){

        const carte = document.createElement("div");

        carte.className = "carte-domaine";

        carte.innerHTML = domaine.titre;

        if(reponses.domaines.includes(domaine.id)){

            carte.classList.add("active");

        }

        carte.addEventListener("click",function(){

            toggleDomaine(domaine.id);

        });

        ligne.appendChild(carte);

    });

    zone.appendChild(ligne);

}

/* ==========================================================
   SCRIPT 2B
   SITUATIONS PROFESSIONNELLES (AFFICHAGE DYNAMIQUE)
========================================================== */

/* ==========================================================
   RENDU DES SITUATIONS
========================================================== */

function afficherSituations(){

    const zone = document.getElementById("zoneSituations");

    if(!zone) return;

    zone.innerHTML = "";

    if(reponses.domaines.length===0){

        return;

    }

    const container=document.createElement("div");

    container.className="zone-situations";

    reponses.domaines.forEach(function(idDomaine){

        const domaine=questionnaire.find(function(item){

            return item.id===idDomaine;

        });

        if(!domaine){

            return;

        }

        const colonne=document.createElement("div");

        colonne.className="colonne-domaine";

        const titre=document.createElement("div");

        titre.className="titre-domaine";

        titre.innerHTML=domaine.titre;

        colonne.appendChild(titre);

        domaine.situations.forEach(function(situation){

            const ligne=document.createElement("div");

            ligne.className="situation";

            const bouton=document.createElement("div");

            bouton.className="bouton-situation";

            if(reponses.situations.includes(situation)){

                bouton.classList.add("active");

            }

            bouton.addEventListener("click",function(){

                toggleSituation(situation);

            });

            const texte=document.createElement("div");

            texte.className="texte-situation";

            texte.innerHTML=situation;

            ligne.appendChild(bouton);

            ligne.appendChild(texte);

            colonne.appendChild(ligne);

        });

        container.appendChild(colonne);

    });

    zone.appendChild(container);

}


/* ==========================================================
   INTÉGRATION AVEC PAGE 3
========================================================== */

document.addEventListener("DOMContentLoaded",function(){

    afficherDomaines();

    afficherSituations();

    chargerEtablissements();

});

/* ==========================================================
   COMPTEUR DES SITUATIONS
========================================================== */

function afficherCompteur(){

    const zone=document.getElementById("zoneCompteur");

    if(!zone) return;

    const nb=reponses.situations.length;

    if(nb<5){

        zone.innerHTML=
        "<div class='compteur-selection'>"+
        nb+
        " situation(s) sélectionnée(s) sur 5</div>";

    }

    else{

        zone.innerHTML=
        "<div class='compteur-selection max'>Maximum de 5 situations atteint</div>";

    }

}

/* ==========================================================
   GESTION DES SITUATIONS
========================================================== */

function toggleSituation(situation){

    const index = reponses.situations.indexOf(situation);

    if(index === -1){

        if(reponses.situations.length >= 5){

            afficherCompteur();

            return;

        }

        reponses.situations.push(situation);

    }
    else{

        reponses.situations.splice(index,1);

    }

    afficherCompteur();

    afficherSituations();

}

/* ==========================================================
   AFFICHAGE DES PRIORITES
========================================================== */

function afficherPriorites(){

    const liste=document.getElementById("listePriorites");

    if(!liste) return;

    liste.innerHTML="";

    reponses.situations.forEach(function(situation,index){

        const carte=document.createElement("div");

        carte.className="carte-priorite";

        carte.dataset.id=index;

        carte.innerHTML=`

            <div class="numero-priorite">

                ${index+1}

            </div>

            <div class="texte-priorite">

                ${situation}

            </div>

        `;

        liste.appendChild(carte);

    });

    new Sortable(liste,{

        animation:200,

        onEnd:function(evt){

            const element=reponses.situations.splice(evt.oldIndex,1)[0];

            reponses.situations.splice(evt.newIndex,0,element);

            afficherPriorites();

        }

    });

}

/* ==========================================================
   CONSTRUIRE LA RÉPONSE
========================================================== */

function construireReponse(){

    enregistrerProfil();

    enregistrerModalites();

    enregistrerMethodes();

    return{

        etablissement : reponses.etablissement,

        commune : reponses.commune,

        uai : reponses.uai,

        genre : reponses.genre,

        anciennete : reponses.anciennete,

        grade : reponses.grade,

        fonction : reponses.fonction,

        domaines : [...reponses.domaines],

        situations : [...reponses.situations],

        modalites : [...reponses.modalites],

        methodes : [...reponses.methodes],

        mail : document.getElementById("mail").value.trim()

    };

}


/* ==========================================================
   VALIDATION MAIL
========================================================== */

function mailValide(mail){

    if(mail==="") return true;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);

}

/* ==========================================================
   ENREGISTRER LES MODALITÉS
========================================================== */

function enregistrerModalites(){

    reponses.modalites = [];

    const cases = document.querySelectorAll(
        "#zoneModalites input[type='checkbox']"
    );

    cases.forEach(function(caseACocher){

        if(caseACocher.checked){

            reponses.modalites.push(caseACocher.value);

        }

    });

}

/* ==========================================================
   BOUTON RETOUR PAGE 4
========================================================== */

const retourPage3 = document.getElementById("retourPage3");

if(retourPage3){

    retourPage3.addEventListener("click",function(){

        allerPage(3);

    });

}

/* ==========================================================
   BOUTON ENVOYER
========================================================== */

const boutonEnvoyer = document.getElementById("envoyerEnquete");

if (boutonEnvoyer) {

    boutonEnvoyer.addEventListener("click", async function () {

        const mail = document.getElementById("mail").value.trim();

        if (!mailValide(mail)) {

            alert("Veuillez saisir une adresse mail valide.");
            return;

        }

        enregistrerModalites();
        enregistrerMethodes();

        if (reponses.modalites.length === 0) {

            alert("Veuillez sélectionner au moins une modalité de formation.");
            return;

        }

        if (reponses.methodes.length === 0) {

            alert("Veuillez sélectionner au moins une méthode pédagogique.");
            return;

        }

        const confirmation = confirm(
            "Confirmez-vous l'envoi de vos réponses ?"
        );

        if (!confirmation) {

            return;

        }

        const donnees = construireReponse();

        try {

            const reponse = await fetch("/envoyer", {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(donnees)

            });

            const resultat = await reponse.json();

            if (resultat.succes) {

                alert("Réponse transmise au serveur.");

            } else {

                alert("Erreur lors de l'envoi.");

            }

        }

        catch (erreur) {

            console.error(erreur);

            alert("Impossible de contacter le serveur.");

        }

    });

}

/* ==========================================================
   CHARGEMENT DU CSV
========================================================== */

function chargerEtablissements(){

    Papa.parse("data/fr-en-annuaire-education.csv",{

        download:true,

        header:true,

        delimiter:";",

        complete:function(resultats){

            etablissements=resultats.data;

            console.log(

                etablissements.length,

                "établissements chargés"

            );

        }

    });

}

/* ==========================================================
   SUPPRESSION DES ACCENTS
========================================================== */

function normaliserTexte(texte){

    return texte
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .toLowerCase()
        .trim();

}


/* ==========================================================
   RECHERCHE DES ETABLISSEMENTS
========================================================== */

function rechercherEtablissements(texte){

    const recherche = normaliserTexte(texte);

    if(recherche.length < 3){

        return [];

    }

    return etablissements.filter(function(etablissement){

        const nom = normaliserTexte(

            etablissement.Nom_etablissement || ""

        );

        return nom.includes(recherche);

    });

}

/* ==========================================================
   AFFICHER LES SUGGESTIONS
========================================================== */

function afficherSuggestions(){

    const liste =
        document.getElementById("listeEtablissements");

    if(!liste) return;

    liste.innerHTML = "";

    if(etablissementsFiltres.length===0){

        liste.style.display="none";

        return;

    }

    etablissementsFiltres.forEach(function(etablissement){

        const ligne=document.createElement("div");

        ligne.className="suggestion-etablissement";

        ligne.innerHTML=
            etablissement.Nom_etablissement
            +" — "
            +etablissement.Nom_commune;

        ligne.addEventListener("click",function(){

            document.getElementById("etablissement").value =
                etablissement.Nom_etablissement;

            etablissementSelectionne = etablissement;

            liste.style.display="none";

        });

        liste.appendChild(ligne);

    });

    liste.style.display="block";

}

/* ==========================================================
   ECOUTE DU CHAMP ETABLISSEMENT
========================================================== */

document.addEventListener("DOMContentLoaded",function(){

    const champ =
        document.getElementById("etablissement");

    if(!champ) return;

    champ.addEventListener("input",function(){

        etablissementSelectionne = null;

        etablissementsFiltres =
            rechercherEtablissements(champ.value);

        afficherSuggestions();

    });

});

/* ==========================================================
   ALLER PAGE
========================================================== */

function allerPage(numero){

    console.log("allerPage :", numero);

    pageCourante = numero;

    afficherPage(numero);

    mettreAJourProgression();

}

console.log("boutonCommencer =", boutonCommencer);

console.log("script.js chargé");

/* ==========================================================
   METHODES
========================================================== */

function enregistrerMethodes(){

    reponses.methodes = [];

    document
        .querySelectorAll("#methodesPedagogiques input[type=checkbox]")
        .forEach(function(caseACocher){

            if(caseACocher.checked){

                if(caseACocher.id==="methodeAutre"){

                    const texte =
                        document
                        .getElementById("texteAutreMethode")
                        .value
                        .trim();

                    if(texte!==""){

                        reponses.methodes.push(

                            "Autre : " + texte

                        );

                    }

                }

                else{

                    reponses.methodes.push(

                        caseACocher.value

                    );

                }

            }

        });

}

/* ==========================================================
   VALIDATION DES MÉTHODES PÉDAGOGIQUES
========================================================== */

function methodesValides(){

    return reponses.methodes.length > 0;

}