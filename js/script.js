"use strict";

/* ============================================================
   BAROMÈTRE EAFC - PERSONNELS ATSS
   Version 3
   ============================================================ */

const VERSION_QUESTIONNAIRE = "3.0";
const CLE_SAUVEGARDE = "barometreEAFC_v3_brouillon";
const DUREE_SAUVEGARDE = 15 * 24 * 60 * 60 * 1000;

let pageCourante = 1;
const nombrePages = 4;
let sortablePriorites = null;


/* ============================================================
   1. DONNÉES DU QUESTIONNAIRE
   ============================================================ */

const reponses = {
  typeStructure: "",
  typeStructureAutre: "",
  departement: "",
  genre: "",

  filiere: "",
  corps: "",
  corpsAutre: "",
  ancienneteCorps: "",

  fonction: "",
  fonctionPrecision: "",
  ancienneteFonction: "",

  domaines: [],
  situations: [],
  priorites: [],

  formationDeuxAns: "",
  leviersEngagement: [],
  levierAutre: ""
};


/* ============================================================
   2. CORPS ET FONCTIONS PAR FILIÈRE
   Ces listes pourront être modifiées après validation
   avec les collègues.
   ============================================================ */

const corpsParFiliere = {

  "Administrative": [
    "ADJAENES — Adjoint administratif de l'Éducation nationale et de l'Enseignement supérieur",
    "SAENES — Secrétaire administratif de l'Éducation nationale et de l'Enseignement supérieur",
    "AAE — Attaché d'administration de l'État",
    "Agent contractuel",
    "Autre corps"
  ],

  "Technique - ITRF": [
    "ATRF — Adjoint technique de recherche et de formation",
    "TRF — Technicien de recherche et de formation",
    "ASI — Assistant ingénieur",
    "IGE — Ingénieur d'études",
    "IGR — Ingénieur de recherche",
    "Agent contractuel",
    "Autre corps"
  ],

  "Sociale": [
    "ASSAE — Assistant de service social des administrations de l'État",
    "CTSSAE — Conseiller technique de service social des administrations de l'État",
    "Agent contractuel",
    "Autre corps"
  ],

  "Santé": [
    "INFENES — Infirmier de l'Éducation nationale et de l'Enseignement supérieur",
    "MEN — Médecin de l'Éducation nationale",
    "Agent contractuel",
    "Autre corps"
  ]
};


const fonctionsParFiliere = {

  "Administrative": [
    "Secrétariat de direction / gestion des élèves",
    "Secrétariat d'intendance",
    "Gestion des ressources humaines",
    "Gestion financière et comptable",
    "Secrétaire général d'EPLE",
    "Fondé de pouvoir",
    "Agent comptable",
    "Chef de bureau ou de division",
    "Fonctions administratives en service académique",
    "Autre fonction"
  ],

  "Technique - ITRF": [
    "Personnel technique de laboratoire",
    "Informatique et systèmes d'information",
    "Maintenance, logistique et équipements",
    "Ingénierie ou expertise technique",
    "Autre fonction"
  ],

  "Sociale": [
    "Assistant de service social des élèves",
    "Assistant de service social des personnels",
    "Conseiller technique de service social",
    "Autre fonction"
  ],

  "Santé": [
    "Infirmier en établissement scolaire",
    "Infirmier conseiller technique",
    "Médecin de l'Éducation nationale",
    "Médecin conseiller technique",
    "Autre fonction"
  ]
};


/* ============================================================
   3. OUTILS
   ============================================================ */

function element(id) {
  return document.getElementById(id);
}


function valeurRadio(nom) {
  const selection = document.querySelector(
    `input[name="${nom}"]:checked`
  );

  return selection ? selection.value : "";
}


function valeursCheckbox(nom) {
  return Array.from(
    document.querySelectorAll(`input[name="${nom}"]:checked`)
  ).map(caseCochee => caseCochee.value);
}


function afficher(elementHTML) {
  if (elementHTML) {
    elementHTML.classList.remove("d-none");
  }
}


function masquer(elementHTML) {
  if (elementHTML) {
    elementHTML.classList.add("d-none");
  }
}


function afficherErreur(id, message) {
  const zone = element(id);

  if (!zone) {
    return;
  }

  zone.textContent = message;
  zone.classList.remove("d-none");
}


function masquerErreur(id) {
  const zone = element(id);

  if (!zone) {
    return;
  }

  zone.textContent = "";
  zone.classList.add("d-none");
}


/* ============================================================
   4. NAVIGATION
   ============================================================ */

function afficherPage(numero) {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const page = element(`page${numero}`);

  if (!page) {
    return;
  }

  page.classList.add("active");

  pageCourante = numero;

  const pourcentage = (numero / nombrePages) * 100;

  const barre = element("barreProgression");
  const texte = element("texteProgression");

  if (barre) {
    barre.style.width = `${pourcentage}%`;
    barre.setAttribute("aria-valuenow", pourcentage);
  }

  if (texte) {
    texte.textContent = `Étape ${numero} sur ${nombrePages}`;
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  sauvegarderBrouillon();
}


function afficherMerci() {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  element("pageMerci")?.classList.add("active");

  const progression = document.querySelector(".progression");

  if (progression) {
    progression.classList.add("d-none");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* ============================================================
   5. PROFIL : CORPS ET FONCTIONS DYNAMIQUES
   ============================================================ */

function remplirListe(select, valeurs, texteInitial) {

  if (!select) {
    return;
  }

  select.innerHTML = "";

  const optionInitiale = document.createElement("option");
  optionInitiale.value = "";
  optionInitiale.textContent = texteInitial;

  select.appendChild(optionInitiale);

  valeurs.forEach(valeur => {

    const option = document.createElement("option");

    option.value = valeur;
    option.textContent = valeur;

    select.appendChild(option);
  });

  select.disabled = false;
}


function actualiserListesFiliere() {

  const filiere = element("filiere")?.value || "";

  const corps = element("corps");
  const fonction = element("fonction");

  if (!filiere) {

    corps.innerHTML =
      '<option value="">Sélectionnez d\'abord votre filière</option>';

    fonction.innerHTML =
      '<option value="">Sélectionnez d\'abord votre filière</option>';

    corps.disabled = true;
    fonction.disabled = true;

    return;
  }

  remplirListe(
    corps,
    corpsParFiliere[filiere] || [],
    "Sélectionnez une réponse"
  );

  remplirListe(
    fonction,
    fonctionsParFiliere[filiere] || [],
    "Sélectionnez une réponse"
  );
}


function gererChampsConditionnelsProfil() {

  const typeStructure = element("typeStructure")?.value || "";
  const corps = element("corps")?.value || "";
  const fonction = element("fonction")?.value || "";

  if (typeStructure === "Autre structure") {
    afficher(element("zoneTypeStructureAutre"));
  } else {
    masquer(element("zoneTypeStructureAutre"));
    element("typeStructureAutre").value = "";
  }

  if (corps === "Autre corps") {
    afficher(element("zoneCorpsAutre"));
  } else {
    masquer(element("zoneCorpsAutre"));
    element("corpsAutre").value = "";
  }

  const fonctionsAvecPrecision = [
    "Fonctions administratives en service académique",
    "Autre fonction"
  ];

  if (fonctionsAvecPrecision.includes(fonction)) {
    afficher(element("zoneFonctionPrecision"));
  } else {
    masquer(element("zoneFonctionPrecision"));
    element("fonctionPrecision").value = "";
  }
}


function enregistrerProfil() {

  reponses.typeStructure =
    element("typeStructure")?.value || "";

  reponses.typeStructureAutre =
    element("typeStructureAutre")?.value.trim() || "";

  reponses.departement =
    valeurRadio("departement");

  reponses.genre =
    valeurRadio("genre");

  reponses.filiere =
    element("filiere")?.value || "";

  reponses.corps =
    element("corps")?.value || "";

  reponses.corpsAutre =
    element("corpsAutre")?.value.trim() || "";

  reponses.ancienneteCorps =
    element("ancienneteCorps")?.value || "";

  reponses.fonction =
    element("fonction")?.value || "";

  reponses.fonctionPrecision =
    element("fonctionPrecision")?.value.trim() || "";

  reponses.ancienneteFonction =
    element("ancienneteFonction")?.value || "";
}


function validerProfil() {

  enregistrerProfil();

  if (
    !reponses.typeStructure ||
    !reponses.departement ||
    !reponses.genre ||
    !reponses.filiere ||
    !reponses.corps ||
    !reponses.ancienneteCorps ||
    !reponses.fonction ||
    !reponses.ancienneteFonction
  ) {

    afficherErreur(
      "erreurProfil",
      "Merci de répondre à toutes les questions avant de poursuivre."
    );

    return false;
  }

  if (
    reponses.typeStructure === "Autre structure" &&
    !reponses.typeStructureAutre
  ) {

    afficherErreur(
      "erreurProfil",
      "Merci de préciser le type de structure."
    );

    return false;
  }

  if (
    reponses.corps === "Autre corps" &&
    !reponses.corpsAutre
  ) {

    afficherErreur(
      "erreurProfil",
      "Merci de préciser votre corps."
    );

    return false;
  }

  if (
    [
      "Fonctions administratives en service académique",
      "Autre fonction"
    ].includes(reponses.fonction) &&
    !reponses.fonctionPrecision
  ) {

    afficherErreur(
      "erreurProfil",
      "Merci de préciser votre fonction."
    );

    return false;
  }

  masquerErreur("erreurProfil");

  return true;
}


/* ============================================================
   6. DOMAINES
   ============================================================ */

function obtenirQuestionnaire() {

  if (
    typeof questionnaire !== "undefined" &&
    Array.isArray(questionnaire)
  ) {
    return questionnaire;
  }

  return [];
}


function rendreDomaines() {

  const zone = element("zoneDomaines");

  if (!zone) {
    return;
  }

  zone.innerHTML = "";

  const ligne = document.createElement("div");
  ligne.className = "ligne-domaines";

  obtenirQuestionnaire().forEach(domaine => {

    const carte = document.createElement("button");

    carte.type = "button";
    carte.className = "carte-domaine";

    if (reponses.domaines.includes(domaine.id)) {
      carte.classList.add("active");
    }

    carte.textContent = domaine.titre;

    carte.addEventListener("click", () => {
      basculerDomaine(domaine.id);
    });

    ligne.appendChild(carte);
  });

  zone.appendChild(ligne);
}


function basculerDomaine(idDomaine) {

  const index = reponses.domaines.indexOf(idDomaine);

  if (index === -1) {

    reponses.domaines.push(idDomaine);

  } else {

    reponses.domaines.splice(index, 1);

    const domaine = obtenirQuestionnaire().find(
      item => item.id === idDomaine
    );

    if (domaine) {

      const situationsDuDomaine = domaine.situations;

      reponses.situations = reponses.situations.filter(
        situation => !situationsDuDomaine.includes(situation)
      );

      reponses.priorites = reponses.priorites.filter(
        situation => !situationsDuDomaine.includes(situation)
      );
    }
  }

  rendreDomaines();
  rendreSituations();
  rendrePriorites();
  mettreAJourCompteur();

  sauvegarderBrouillon();
}


/* ============================================================
   7. SITUATIONS PROFESSIONNELLES
   ============================================================ */

function rendreSituations() {

  const zone = element("zoneSituations");

  if (!zone) {
    return;
  }

  zone.innerHTML = "";

  if (reponses.domaines.length === 0) {
    return;
  }

  reponses.domaines.forEach(idDomaine => {

    const domaine = obtenirQuestionnaire().find(
      item => item.id === idDomaine
    );

    if (!domaine) {
      return;
    }

    const bloc = document.createElement("div");
    bloc.className = "bloc-situations";

    const titre = document.createElement("h2");
    titre.textContent = domaine.titre;

    bloc.appendChild(titre);

    const liste = document.createElement("div");
    liste.className = "liste-situations";

    domaine.situations.forEach(situation => {

      const bouton = document.createElement("button");

      bouton.type = "button";
      bouton.className = "bouton-situation";
      bouton.textContent = situation;

      if (reponses.situations.includes(situation)) {
        bouton.classList.add("active");
      }

      bouton.addEventListener("click", () => {
        basculerSituation(situation);
      });

      liste.appendChild(bouton);
    });

    bloc.appendChild(liste);
    zone.appendChild(bloc);
  });
}


function basculerSituation(situation) {

  masquerErreur("erreurSituations");

  const index = reponses.situations.indexOf(situation);

  if (index === -1) {

    if (reponses.situations.length >= 5) {

      afficherErreur(
        "erreurSituations",
        "Vous pouvez sélectionner au maximum 5 situations professionnelles."
      );

      return;
    }

    reponses.situations.push(situation);
    reponses.priorites.push(situation);

  } else {

    reponses.situations.splice(index, 1);

    reponses.priorites =
      reponses.priorites.filter(item => item !== situation);
  }

  rendreSituations();
  rendrePriorites();
  mettreAJourCompteur();

  sauvegarderBrouillon();
}


function mettreAJourCompteur() {

  const compteur = element("zoneCompteur");

  if (!compteur) {
    return;
  }

  const nombre = reponses.situations.length;

  compteur.textContent =
    `${nombre} situation${nombre > 1 ? "s" : ""} sélectionnée${nombre > 1 ? "s" : ""} sur 5`;

  compteur.classList.toggle("compteur-max", nombre === 5);
}


/* ============================================================
   8. CLASSEMENT DES PRIORITÉS
   ============================================================ */

function rendrePriorites() {

  const zone = element("zonePriorites");
  const liste = element("listePriorites");

  if (!zone || !liste) {
    return;
  }

  if (reponses.priorites.length === 0) {

    masquer(zone);
    liste.innerHTML = "";

    return;
  }

  afficher(zone);

  liste.innerHTML = "";

  reponses.priorites.forEach((situation, index) => {

    const item = document.createElement("div");

    item.className = "item-priorite";
    item.dataset.situation = situation;

    const numero = document.createElement("span");
    numero.className = "numero-priorite";
    numero.textContent = `${index + 1}.`;

    const texte = document.createElement("span");
    texte.className = "texte-priorite";
    texte.textContent = situation;

    const poignee = document.createElement("span");
    poignee.className = "poignee-priorite";
    poignee.textContent = "☰";
    poignee.title = "Déplacer cette situation";

    item.appendChild(numero);
    item.appendChild(poignee);
    item.appendChild(texte);

    liste.appendChild(item);
  });

  initialiserSortable();
}


function initialiserSortable() {

  const liste = element("listePriorites");

  if (!liste || typeof Sortable === "undefined") {
    return;
  }

  if (sortablePriorites) {
    sortablePriorites.destroy();
  }

  sortablePriorites = new Sortable(liste, {

    animation: 150,
    handle: ".poignee-priorite",

    onEnd: () => {

      reponses.priorites = Array.from(
        liste.querySelectorAll(".item-priorite")
      ).map(item => item.dataset.situation);

      rendrePriorites();
      sauvegarderBrouillon();
    }
  });
}


function validerSituations() {

  if (
    reponses.situations.length < 1 ||
    reponses.situations.length > 5
  ) {

    afficherErreur(
      "erreurSituations",
      "Merci de sélectionner entre 1 et 5 situations professionnelles."
    );

    return false;
  }

  masquerErreur("erreurSituations");

  return true;
}


/* ============================================================
   9. ÉTAPE 4 : ENGAGEMENT EN FORMATION
   ============================================================ */

function gererLevierAutre() {

  const coche = element("levierAutreCase")?.checked;

  if (coche) {

    afficher(element("zoneLevierAutre"));

  } else {

    masquer(element("zoneLevierAutre"));

    if (element("levierAutre")) {
      element("levierAutre").value = "";
    }
  }
}


function enregistrerEngagement() {

  reponses.formationDeuxAns =
    valeurRadio("formationDeuxAns");

  reponses.leviersEngagement =
    valeursCheckbox("leviersEngagement");

  reponses.levierAutre =
    element("levierAutre")?.value.trim() || "";
}


function validerEngagement() {

  enregistrerEngagement();

  if (!reponses.formationDeuxAns) {

    afficherErreur(
      "erreurFinale",
      "Merci d'indiquer si vous avez participé à une formation au cours des deux dernières années."
    );

    return false;
  }

  if (reponses.leviersEngagement.length === 0) {

    afficherErreur(
      "erreurFinale",
      "Merci de sélectionner au moins un élément facilitant votre engagement en formation."
    );

    return false;
  }

  if (
    reponses.leviersEngagement.includes("Autre") &&
    !reponses.levierAutre
  ) {

    afficherErreur(
      "erreurFinale",
      "Merci de préciser votre réponse « Autre »."
    );

    return false;
  }

  masquerErreur("erreurFinale");

  return true;
}


/* ============================================================
   10. SAUVEGARDE AUTOMATIQUE - 15 JOURS
   ============================================================ */

function sauvegarderBrouillon() {

  enregistrerProfil();
  enregistrerEngagement();

  const brouillon = {
    version: VERSION_QUESTIONNAIRE,
    savedAt: Date.now(),
    currentPage: pageCourante,
    reponses: reponses
  };

  try {

    localStorage.setItem(
      CLE_SAUVEGARDE,
      JSON.stringify(brouillon)
    );

  } catch (erreur) {

    console.warn(
      "La sauvegarde locale n'a pas pu être effectuée."
    );
  }
}


function lireBrouillon() {

  try {

    const contenu =
      localStorage.getItem(CLE_SAUVEGARDE);

    if (!contenu) {
      return null;
    }

    const brouillon = JSON.parse(contenu);

    if (
      !brouillon.savedAt ||
      Date.now() - brouillon.savedAt > DUREE_SAUVEGARDE
    ) {

      localStorage.removeItem(CLE_SAUVEGARDE);

      return null;
    }

    if (brouillon.version !== VERSION_QUESTIONNAIRE) {
      return null;
    }

    return brouillon;

  } catch (erreur) {

    return null;
  }
}


function restaurerBrouillon(brouillon) {

  if (!brouillon || !brouillon.reponses) {
    return;
  }

  Object.assign(reponses, brouillon.reponses);

  restaurerProfil();
  restaurerEngagement();

  rendreDomaines();
  rendreSituations();
  rendrePriorites();
  mettreAJourCompteur();

  const pageAReprendre =
    Number(brouillon.currentPage) || 1;

  afficherPage(
    Math.min(
      Math.max(pageAReprendre, 1),
      nombrePages
    )
  );
}


function restaurerProfil() {

  element("typeStructure").value =
    reponses.typeStructure || "";

  element("typeStructureAutre").value =
    reponses.typeStructureAutre || "";

  const departement = document.querySelector(
    `input[name="departement"][value="${reponses.departement}"]`
  );

  if (departement) {
    departement.checked = true;
  }

  const genre = document.querySelector(
    `input[name="genre"][value="${reponses.genre}"]`
  );

  if (genre) {
    genre.checked = true;
  }

  element("filiere").value =
    reponses.filiere || "";

  actualiserListesFiliere();

  if (reponses.corps) {
    element("corps").value = reponses.corps;
  }

  if (reponses.fonction) {
    element("fonction").value = reponses.fonction;
  }

  element("corpsAutre").value =
    reponses.corpsAutre || "";

  element("ancienneteCorps").value =
    reponses.ancienneteCorps || "";

  element("fonctionPrecision").value =
    reponses.fonctionPrecision || "";

  element("ancienneteFonction").value =
    reponses.ancienneteFonction || "";

  gererChampsConditionnelsProfil();
}


function restaurerEngagement() {

  if (reponses.formationDeuxAns) {

    const radio = document.querySelector(
      `input[name="formationDeuxAns"][value="${reponses.formationDeuxAns}"]`
    );

    if (radio) {
      radio.checked = true;
    }
  }

  document.querySelectorAll(
    'input[name="leviersEngagement"]'
  ).forEach(caseACocher => {

    caseACocher.checked =
      reponses.leviersEngagement.includes(
        caseACocher.value
      );
  });

  element("levierAutre").value =
    reponses.levierAutre || "";

  gererLevierAutre();
}


function effacerBrouillon() {

  try {
    localStorage.removeItem(CLE_SAUVEGARDE);
  } catch (erreur) {
    // Rien à faire.
  }
}


function recommencerQuestionnaire() {

  effacerBrouillon();

  window.location.reload();
}


/* ============================================================
   11. CONSTRUCTION DES DONNÉES À ENVOYER
   ============================================================ */

function construireDonneesEnvoi() {

  enregistrerProfil();
  enregistrerEngagement();

  return {

    version: VERSION_QUESTIONNAIRE,

    typeStructure: reponses.typeStructure,
    typeStructureAutre: reponses.typeStructureAutre,
    departement: reponses.departement,
    genre: reponses.genre,

    filiere: reponses.filiere,
    corps: reponses.corps,
    corpsAutre: reponses.corpsAutre,
    ancienneteCorps: reponses.ancienneteCorps,

    fonction: reponses.fonction,
    fonctionPrecision: reponses.fonctionPrecision,
    ancienneteFonction: reponses.ancienneteFonction,

    domaines: [...reponses.domaines],
    situations: [...reponses.situations],
    priorites: [...reponses.priorites],

    formationDeuxAns: reponses.formationDeuxAns,
    leviersEngagement: [...reponses.leviersEngagement],
    levierAutre: reponses.levierAutre
  };
}


/* ============================================================
   12. ENVOI FINAL
   ============================================================ */

async function envoyerQuestionnaire() {

  if (!validerEngagement()) {
    return;
  }

  if (!validerProfil()) {

    afficherErreur(
      "erreurFinale",
      "Certaines informations de votre profil sont incomplètes. Merci de revenir à l'étape 2."
    );

    return;
  }

  if (!validerSituations()) {

    afficherErreur(
      "erreurFinale",
      "Votre sélection de situations professionnelles est incomplète. Merci de revenir à l'étape 3."
    );

    return;
  }

  const bouton = element("envoyerQuestionnaire");

  if (bouton) {
    bouton.disabled = true;
    bouton.textContent = "Envoi en cours...";
  }

  const donnees = construireDonneesEnvoi();

  try {

    const reponseServeur = await fetch("/envoyer", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(donnees)
    });

    if (!reponseServeur.ok) {

      throw new Error(
        `Erreur serveur : ${reponseServeur.status}`
      );
    }

    effacerBrouillon();

    afficherMerci();

  } catch (erreur) {

    console.error(
      "Erreur lors de l'envoi du questionnaire.",
      erreur
    );

    afficherErreur(
      "erreurFinale",
      "L'envoi n'a pas pu être effectué. Vos réponses restent enregistrées sur cet appareil. Merci de réessayer ultérieurement."
    );

  } finally {

    if (bouton) {
      bouton.disabled = false;
      bouton.textContent = "Envoyer mes réponses";
    }
  }
}


/* ============================================================
   13. ÉVÉNEMENTS
   ============================================================ */

function installerEvenements() {

  /* ---------- Navigation ---------- */

  element("boutonCommencer")?.addEventListener(
    "click",
    () => afficherPage(2)
  );

  element("retourPage1")?.addEventListener(
    "click",
    () => afficherPage(1)
  );

  element("versPage3")?.addEventListener(
    "click",
    () => {

      if (validerProfil()) {
        sauvegarderBrouillon();
        afficherPage(3);
      }
    }
  );

  element("retourPage2")?.addEventListener(
    "click",
    () => afficherPage(2)
  );

  element("versPage4")?.addEventListener(
    "click",
    () => {

      if (validerSituations()) {
        sauvegarderBrouillon();
        afficherPage(4);
      }
    }
  );

  element("retourPage3")?.addEventListener(
    "click",
    () => afficherPage(3)
  );

  element("envoyerQuestionnaire")?.addEventListener(
    "click",
    envoyerQuestionnaire
  );


  /* ---------- Profil ---------- */

  element("typeStructure")?.addEventListener(
    "change",
    () => {
      gererChampsConditionnelsProfil();
      sauvegarderBrouillon();
    }
  );

  element("filiere")?.addEventListener(
    "change",
    () => {

      reponses.corps = "";
      reponses.fonction = "";
      reponses.corpsAutre = "";
      reponses.fonctionPrecision = "";

      actualiserListesFiliere();
      gererChampsConditionnelsProfil();

      sauvegarderBrouillon();
    }
  );

  element("corps")?.addEventListener(
    "change",
    () => {
      gererChampsConditionnelsProfil();
      sauvegarderBrouillon();
    }
  );

  element("fonction")?.addEventListener(
    "change",
    () => {
      gererChampsConditionnelsProfil();
      sauvegarderBrouillon();
    }
  );


  /* ---------- Étape 4 ---------- */

  element("levierAutreCase")?.addEventListener(
    "change",
    () => {
      gererLevierAutre();
      sauvegarderBrouillon();
    }
  );


  /* ---------- Reprise ---------- */

  element("boutonReprendre")?.addEventListener(
    "click",
    () => {

      const brouillon = lireBrouillon();

      if (brouillon) {
        restaurerBrouillon(brouillon);
      }
    }
  );

  element("boutonRecommencer")?.addEventListener(
    "click",
    recommencerQuestionnaire
  );


  /* ---------- Sauvegarde automatique ---------- */

  document.addEventListener(
    "change",
    sauvegarderBrouillon
  );

  document.addEventListener(
    "input",
    sauvegarderBrouillon
  );
}


/* ============================================================
   14. INITIALISATION
   ============================================================ */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    actualiserListesFiliere();
    gererChampsConditionnelsProfil();

    rendreDomaines();
    rendreSituations();
    rendrePriorites();
    mettreAJourCompteur();

    installerEvenements();

    const brouillon = lireBrouillon();

    if (brouillon) {

      afficher(element("zoneReprise"));

    } else {

      masquer(element("zoneReprise"));
    }

    if (brouillon) {

  /* Affiche la première page sans écraser
     la page enregistrée dans le brouillon */
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  element("page1")?.classList.add("active");

  pageCourante = 1;

  const barre = element("barreProgression");
  const texte = element("texteProgression");

  if (barre) {
    barre.style.width = "25%";
    barre.setAttribute("aria-valuenow", 25);
  }

  if (texte) {
    texte.textContent = "Étape 1 sur 4";
  }

} else {

  afficherPage(1);
}
  }
);