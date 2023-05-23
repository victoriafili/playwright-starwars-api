const { expect, test } = require('@playwright/test');
const axios = require('axios');

const {
    BASE_URL
} = require("../constants");

test.describe.serial("API testing in S.W.A.P.I.", () => {
    let context, page;

    test.beforeAll(async({ browser }) => {
        context = await browser.newContext();
        page = await context.newPage();
    });

    test('SWAPI Navigation', async () => {
        await page.goto(BASE_URL);
        const pageTitle = await page.title();

        expect(pageTitle).toBe('SWAPI - The Star Wars API');
    });

    test('should find a film with the title "A New Hope"', async() => {
        await page.goto(BASE_URL + '/api/films/');
        const filmsList = await axios.get(BASE_URL + '/api/films/');

        const films = filmsList.data.results;
        const filmNewHope = films.find((film) => film.title === 'A New Hope');

        expect(filmNewHope).toBeTruthy();
    });

    test('should find person with name "Biggs Darklighter" among characters in "A New Hope"', async () => {
        const filmNewHopeUrl = BASE_URL + '/api/films/1';
        const filmNewHopeResponse = await axios.get(filmNewHopeUrl);
      
        const charactersUrls = filmNewHopeResponse.data.characters;
        const charactersResponse = await Promise.all(charactersUrls.map(url => axios.get(url)));
        const charactersData = charactersResponse.map(response => response.data);
      
        const charBiggsDarklighter = charactersData.find(character => character.name === 'Biggs Darklighter');

        expect(charBiggsDarklighter).toBeTruthy();
    });

    test('should check starship details for "Biggs Darklighter"', async () => {
        // Check if starship class is “Starfighter”
        const charBiggsUrl = BASE_URL + '/api/people/9';
        const charBiggsResponse = await axios.get(charBiggsUrl);
      
        const starshipUrl = charBiggsResponse.data.starships[0];
        const starshipResponse = await axios.get(starshipUrl);
        const starship = starshipResponse.data;
      
        expect(starship).toBeTruthy();
        expect(starship.starship_class).toBe('Starfighter');
      
        // Check if “Luke Skywalker” is among pilots that were also flying this
        const pilotLukeSkywalkerUrl = BASE_URL + '/api/people/1';
        const pilotLukeResponse = await axios.get(pilotLukeSkywalkerUrl);
        const pilotLukeSkywalker = pilotLukeResponse.data;
      
        const pilotsUrls = starship.pilots;
        const pilotsResponse = await Promise.all(pilotsUrls.map(url => axios.get(url)));
        const pilotsData = pilotsResponse.map(response => response.data);
      
        const pilotLs = pilotsData.find(pilot => pilot.name === pilotLukeSkywalker.name);
        
        expect(pilotLs).toBeTruthy();
    });
});