let meteo = document.querySelector("body")
let dateHeure = document.querySelector(".date-heure")
let jourNuit = document.querySelector(".jour-nuit")
let meteoActuelle = document.querySelector(".meteo-actuelle")
let vent = document.querySelector(".vent")
let meteoH1 = document.querySelector(".container-meteo-h1")
let meteoJ1 = document.querySelector(".container-meteo-j1")
let divVide = document.querySelector(".vide2")

/**
 * Cette fonction permet d'afficher la date et l'heure dans le code HTML
*/
function afficheLaDate(){
    let D = new Date()
    let date = D.toLocaleDateString()
    let time = D.toLocaleTimeString()
    dateHeure.innerHTML = `
    <p class="date">${date}</p>
    <p class="heure">${time}</p>
    `
    requestAnimationFrame(afficheLaDate)
}

afficheLaDate()

navigator.geolocation.getCurrentPosition(success=>{
    let longitude = success.coords.longitude
    let latitude = success.coords.latitude
    let url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code,temperature_2m,precipitation,is_day,snowfall,cloud_cover,wind_speed_10m,wind_direction_10m&hourly=weather_code,temperature_2m,rain,cloud_cover,wind_speed_80m,wind_direction_80m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,snowfall_sum&timezone=auto`
    fetch(url)
    .then(res=>{
        return res.json()
    })
    .then(data=>{
        console.log(data)
        background(data.current)
        templateJourNuit(data.current)
        templateMeteoActuelle(data.current)
        templateVent(data.current)
        templateMeteoH1(data.hourly)
        templateMeteoJ1(data.daily)
    })
    let urlGeoloc = `https://geo.api.gouv.fr/communes?lat=${latitude}&lon=${longitude}&fields=code,nom,codesPostaux,surface,population,centre,contour`
    fetch(urlGeoloc)
    .then(res=>{
        return res.json()
    })
    .then(data=>{
        console.log(data)
        templateGeolocVille(data)
    })
})

function templateGeolocVille (chemin){
    console.log(chemin[0].nom)
    divVide.innerHTML =`
    <p>Météo à ${chemin[0].nom}</p>
    `
}


function background(donnee){
    if (donnee.weather_code<=99 && donnee.weather_code>=95) {
        meteo.style.backgroundImage = "url(./img/thunder.jpg)"
    }else if(donnee.weather_code>=51 && donnee.weather_code<=67 || donnee.weather_code>=80 && donnee.weather_code<=82){
        meteo.style.backgroundImage = "url(./img/rain.jpg)"
    }else if(donnee.weather_code>=1 && donnee.weather_code<=2){
        meteo.style.backgroundImage = "url(./img/suncloud.jpg)"
    }else if(donnee.weather_code===3){
        meteo.style.backgroundImage = "url(./img/cloud.jpg)"
    }else if(donnee.weather_code===0){
        meteo.style.backgroundImage = "url(./img/sun.jpg)"
    }else if(donnee.weather_code>=71 && donnee.weather_code<=77 || donnee.weather_code>=85 && donnee.weather_code<=86){
        meteo.style.backgroundImage = "url(./img/snow.jpg)"
    }
}

/**
 * Cette fonction permet d'afficher un picto jour ou nuit en fonction d'un nombre si 1 alors jour sinon nuit
 * @param {Number} donnee 
 */
function templateJourNuit(donnee){
    let jourOuNuit = ""
    if (donnee.is_day ===1) {
        jourOuNuit = "jour"
    }else{
        jourOuNuit = "nuit"
    }
    jourNuit.innerHTML = `
    <span class="picto-jour-nuit ${jourOuNuit}"></span>
    `
}

/**
 * Cette fonction permet de modifier la section "météo actuelle"
 * @param {Array} donnee 
 */
function templateMeteoActuelle(donnee){
    let picto = ""
    let tempsActuel = ""
    if (donnee.weather_code<=99 && donnee.weather_code>=95) {
        picto = "orage"
        tempsActuel = "Orageux"
    }else if(donnee.weather_code>=51 && donnee.weather_code<=67 && donnee.weather_code>=80 && donnee.weather_code<=82){
        picto = "pluie"
        tempsActuel = "Pluvieux"
    }else if(donnee.weather_code>=1 && donnee.weather_code<=2){
        picto = "soleil-nuage"
        tempsActuel = "Partiellement couvert"
    }else if(donnee.weather_code===3){
        picto = "nuage"
        tempsActuel = "Principalement couvert"
    }else if(donnee.weather_code===100){
        picto = "vent"
        tempsActuel = "Venteux"
    }else if(donnee.weather_code===0){
        picto = "soleil"
        tempsActuel = "Ensoleillé"
    }else if(donnee.weather_code>=71 && donnee.weather_code<=77 && donnee.weather_code>=85 && donnee.weather_code<=86){
        picto = "neige"
        tempsActuel = "Chute de neige"
    }
    meteoActuelle.innerHTML=`
    <p class="temps-actuel">${tempsActuel}</p>
    <span class="picto ${picto}"></span>
    <p class="temp-max">${donnee.temperature_2m}°C</p>
    `
}
/**
 * Cette fonction permet de modifier la section "vent"
 * @param {Array} donnee 
 */
function templateVent(donnee){
    vent.innerHTML=`
    <div class="boussole">
    <img src="img/compass.png" alt="compas">
    <img src="img/compass-arrow.png" alt="aiguille compas" class="aiguille">
    </div>
    <p class="vitesse-vent"> ${donnee.wind_speed_10m} km/heure</p>
    `
    let aiguille = document.querySelector(".aiguille")
    aiguille.style.transform = `translate(-50%,-50%) rotate(${donnee.wind_direction_10m}deg)`
}

/**
 * Cette fonction permet d'ajouter les cartes j1 à la section "météo h"
 * @param {String} donnees 
 */
function templateMeteoH1(donnees){
    let tempH = 0
    let pluieH = 0
    let heure = ""
    for (let index = 0; index < 24; index++) {
        tempH = donnees.temperature_2m[index];
        pluieH = donnees.rain[index];
        heure = splitDate(donnees.time[index])
        meteoH1.innerHTML+=`
        <div class="meteo-h1 flex">
            <div class="flex align-center">
                <img src="img/thermometer.png" alt="température">
                <p class="temp-h">${tempH} °C</p>
            </div>
            <div class="flex align-center">
                <img src="img/umbrella.png" alt="pluie">
                <p class="pluie">${pluieH} mm</p>
            </div>
            <p class="instant">${heure}h00</p>
        </div>
        `
    }
}

/**
 * Cette fonction permet de récupérer l'heure d'une chaine de caractères composée d'une date et d'une heure
 * @param {String} dateHeure 
 * @returns String
 */
function splitDate(dateHeure){
    let tabDateHeure = dateHeure.split("T")
    let heure = tabDateHeure[1].split(":")
    return heure[0]
}

/**
 * Cette fonction permet d'ajouter les cartes j1 à la section "météo j"
 * @param {String} donnee 
 */
function templateMeteoJ1(donnee){
    let dateModifiee = ""
    let picto = ""
    let temperatureMax = 0
    let temperatureMin = 0
    for (let index = 1; index <= 6; index++) {
        dateModifiee = dateVersEU(donnee.time[index])
        temperatureMax = donnee.temperature_2m_max[index]
        temperatureMin = donnee.temperature_2m_min[index]
        if (donnee.weather_code[index]<=99 && donnee.weather_code[index]>=95) {
            picto = "mini-orage"
        }else if(donnee.weather_code[index]>=51 && donnee.weather_code[index]<=67 || donnee.weather_code[index]>=80 && donnee.weather_code[index]<=82){
            picto = "mini-pluie"
        }else if(donnee.weather_code[index]>=1 && donnee.weather_code[index]<=2){
            picto = "mini-mitige"
        }else if(donnee.weather_code[index]===3){
            picto = "mini-nuage"
        }else if(donnee.weather_code[index]===0){
            picto = "mini-soleil"
        }else if(donnee.weather_code[index]>=71 && donnee.weather_code[index]<=77 || donnee.weather_code[index]>=85 && donnee.weather_code[index]<=86){
            picto = "mini-neige"
        }
        meteoJ1.innerHTML+=`
        <div class="meteo-j1 flex">
            <p class="date-j">${dateModifiee}</p>
            <span class="mini-pictos ${picto}"></span>
            <p class="temp-j-max">max ${temperatureMax}°C</p>
            <p class="temp-j-min">min ${temperatureMin}°C</p>
        </div>
        `
    }
}

/**
 * Cette fonction permet de retourner une date EU à partir d'une date US
 * @param {String} dateUS 
 * @returns String
 */
function dateVersEU(dateUS){
    let dateSplit = dateUS.split("-")
    return dateSplit[2]+"/"+dateSplit[1]+"/"+dateSplit[0]
}