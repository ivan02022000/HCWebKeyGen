// ==UserScript==
// @name        HC Keys generator + Input
// @namespace   Violentmonkey Scripts
// @match        *://*.hamsterkombat.io/*
// @match        *://*.hamsterkombatgame.io/*
// @exclude      https://hamsterkombatgame.io/games/UnblockPuzzle/*
// @grant       none
// @version     1.0
// @author      -
// @description 8/08/2024
// @require     https://cdn.jsdelivr.net/npm/axios@v1.0.0-alpha.1/dist/axios.min.js
// @icon         https://hamsterkombatgame.io/images/icons/hamster-coin.png
// @downloadURL  https://github.com/ivan02022000/HCWebKeyGen/edit/main/key_autoinput.js
// @updateURL    https://github.com/ivan02022000/HCWebKeyGen/edit/main/key_autoinput.js
// ==/UserScript==

// bike
const name1 = '1 bike'
const appToken1 = 'd28721be-fd2d-4b45-869e-9f253b554e50';
const promoId1 = '43e35910-c168-4634-ad4f-52fd764a843f';

// Chain Cube 2048
const name2 = '2 2048'
const appToken2 = "d1690a07-3780-4068-810f-9b5bbf2931b2";
const promoId2 = "b4170868-cef0-424f-8eb9-be0622e8e8e3";

// My clone army
const name3 = '3 clone'
const appToken3 = "74ee0b5b-775e-4bee-974f-63e7f4d5bacb";
const promoId3 = "fe693b26-b342-4159-8808-15e3ff7f8767";

// Train miner
const name4 = '4 train'
const appToken4 = "82647f43-3f87-402d-88dd-09a90025313f";
const promoId4 = "c4480ac7-e178-4973-8061-9ed5b2e17954";

let ready_codes = [];

async function generateClientId() {
    const timestamp = Date.now();
    const randomNumbers = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('');
    return `${timestamp}-${randomNumbers}`;
}

async function loginClient(appToken) {
    const clientId = await generateClientId();
    try {
        const response = await axios.post('https://api.gamepromo.io/promo/login-client', {
            appToken: appToken,
            clientId: clientId,
            clientOrigin: 'deviceid'
        }, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            }
        });
        return response.data.clientToken; // Предполагается, что токен находится в response.data.token
    } catch (error) {
        console.error('Ошибка при входе клиента:', error.message);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return loginClient(appToken); // Рекурсивный вызов
    }
}

async function registerEvent(token, promoId) {
    const eventId = generateRandomUUID();
    try {
        const response = await axios.post('https://api.gamepromo.io/promo/register-event', {
            promoId: promoId,
            eventId: eventId,
            eventOrigin: 'undefined'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json; charset=utf-8',
            }
        });

        if (response.data.hasCode === false) {
            // console.log('Retry register event');
            await new Promise(resolve => setTimeout(resolve, 5000));
            return registerEvent(token, promoId); // Рекурсивный вызов
        } else {
            return true;
        }
    } catch (error) {
        // console.error('Ошибка при регистрации события:', error.message);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return registerEvent(token, promoId); // Рекурсивный вызов в случае ошибки
    }
}

async function createCode(token, promoId) {
    let response;
    do {
        try {
            response = await axios.post('https://api.gamepromo.io/promo/create-code', {
                promoId: promoId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json; charset=utf-8',
                }
            });
            // console.log(response.data);
        } catch (error) {
            console.error('Ошибка при создании кода:', error.message);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } while (!response || !response.data.promoCode); // Повторяем запрос, если ничего не возвращает

    return response.data.promoCode; // Возвращаем сгенерированный код
}

function generateRandomUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0,
              v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function main() {
    try_make_4_keys(appToken1, promoId1, name1)
    try_make_4_keys(appToken2, promoId2, name2)
    try_make_4_keys(appToken3, promoId3, name3)
    try_make_4_keys(appToken4, promoId4, name4)
}

function try_make_4_keys(appToken, promoId, name){
    try {
        for (let i = 0; i < 4; i++) {
            console.log('activate game ', name)
            setTimeout(function(){gen(appToken, promoId, name)}, 1000*(i + 1));
        }
    } catch (error) {
        console.error(name, ': Ошибка:', error.response ? error.response.data : error.message);
    }
}


async function gen(appToken, promoId, gameName) {
    const token = await loginClient(appToken);
    console.log(token)
    await registerEvent(token, promoId);
    var codeData = await createCode(token, promoId);
    console.log('Сгенерированный код для ' , gameName , ": ", codeData);
    ready_codes.push(codeData)
}


const logPrefix = "HC Keys Gen + Input:"


function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
}

function inputCode(code) {
    const inputText = document.querySelector('.promocode-input-container input'); // text
    if (inputText) {
        inputText.focus();
        inputText.value = "";
        inputText.value = code;
        inputText.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
        inputText.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true }));
        inputText.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
        inputText.dispatchEvent(new Event('input', { bubbles: true }));
        inputText.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`${logPrefix}${code} inputed`);
    } else {
      console.log(`${logPrefix}'inputText' not found`);
    }
}

function clickInputButton() {
    const inputButton = document.querySelector('.promocode-input-container button');

    if (inputButton) {
        inputButton.click();
        console.log(`${logPrefix}'Input' button clicked`);
    } else {
      console.log(`${logPrefix}'Input' button not found`);
    }
}

async function inputCodesAndPress() {
    const inputContainer = document.querySelector('.promocode-input-container');
    if (inputContainer){
      inputCode("wait for a code!")
      if (ready_codes.length > 0){
        let code = ready_codes[0]
        ready_codes.shift()
        inputCode(code)
        setTimeout(clickInputButton, getRandomNumber(1000, 1500));
      } else {
        console.log(`${logPrefix} code not ready`)
      }
    } else {
      console.log(`${logPrefix} input container not found`)
    }
    //clickInputButton();
    setTimeout(inputCodesAndPress, getRandomNumber(2000, 3000));
}

// inputCodeAndPress("I want Key!")

// main();
inputCodesAndPress();


let is_working = false

async function keygenButtonReload(){
  is_working = false;
  keygenButton.textContent = '🔑';
  console.log(`${logPrefix}button reload`)
}

async function keygenPress(){
  console.log(`${logPrefix}keygen button pressed`);
  if (is_working == false){
    main();
    
    console.log(`${logPrefix}start working`)
    is_working = true;
    this.textContent = '⏳';
    setTimeout(keygenButtonReload, 1000*120);
  }
}

const keygenButton = document.createElement('button');

function createButton(){
  // const keygenButton = document.createElement('button');
  keygenButton.className = 'keygen-button';
  keygenButton.textContent = '🔑';
  keygenButton.onclick = keygenPress;
  console.log("start")
  document.body.appendChild(keygenButton);

  const style = document.createElement('style');
    style.textContent = `
   .keygen-button {
      position: fixed;
      bottom: 80px;
      right: 20px;
      background-color: rgba(36, 146, 255, 0.8);
      color: #fff;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 18px;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      z-index: 9998;
    }`

    document.head.appendChild(style);
}

createButton()
