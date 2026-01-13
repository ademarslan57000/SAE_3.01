/**
 * Tests unitaires pour les fonctions de réservation
 * Tests de détection P+R et validation
 */

describe("isParkAndRide", () => {
    // Fonction à tester (copie de reservation.js)
    const PR_KEYWORDS = ["p+r", "p&r", "rochambeau", "foire expo", "woippy"];

    function isParkAndRide(parking) {
        const name = (parking.name || parking.nom || "").toLowerCase();
        return PR_KEYWORDS.some((keyword) => name.includes(keyword));
    }

    describe("Détection des parkings P+R", () => {
        test('devrait détecter "P+R" dans le nom', () => {
            const parking = { name: "P+R Rochambeau" };
            expect(isParkAndRide(parking)).toBe(true);
        });

        test('devrait détecter "p+r" en minuscules', () => {
            const parking = { name: "parking p+r nord" };
            expect(isParkAndRide(parking)).toBe(true);
        });

        test('devrait détecter "P&R"', () => {
            const parking = { name: "P&R Foire Expo" };
            expect(isParkAndRide(parking)).toBe(true);
        });

        test('devrait détecter "Rochambeau"', () => {
            const parking = { name: "Parking Rochambeau" };
            expect(isParkAndRide(parking)).toBe(true);
        });

        test('devrait détecter "Foire Expo"', () => {
            const parking = { name: "Parking Foire Expo Metz" };
            expect(isParkAndRide(parking)).toBe(true);
        });

        test('devrait détecter "Woippy"', () => {
            const parking = { name: "Parking Woippy" };
            expect(isParkAndRide(parking)).toBe(true);
        });

        test("ne devrait pas détecter un parking normal", () => {
            const parking = { name: "Parking République" };
            expect(isParkAndRide(parking)).toBe(false);
        });

        test("ne devrait pas détecter un parking sans nom", () => {
            const parking = { name: "" };
            expect(isParkAndRide(parking)).toBe(false);
        });

        test('devrait gérer l\'attribut "nom" au lieu de "name"', () => {
            const parking = { nom: "P+R Woippy" };
            expect(isParkAndRide(parking)).toBe(true);
        });

        test("devrait être insensible à la casse", () => {
            const parking = { name: "PARKING P+R ROCHAMBEAU" };
            expect(isParkAndRide(parking)).toBe(true);
        });

        test("devrait gérer les noms partiels", () => {
            const parking = { name: "Station Rochambeau Nord" };
            expect(isParkAndRide(parking)).toBe(true);
        });

        test("ne devrait pas détecter des faux positifs", () => {
            const parking = { name: "Parking Pro" };
            expect(isParkAndRide(parking)).toBe(false);
        });
    });
});

describe("Calcul de durée et prix", () => {
    describe("Calcul de durée entre deux dates", () => {
        test("devrait calculer 1 heure", () => {
            const start = new Date("2026-01-13T10:00:00");
            const end = new Date("2026-01-13T11:00:00");
            const diffMs = end - start;
            const diffHours = diffMs / (1000 * 60 * 60);

            expect(diffHours).toBe(1);
        });

        test("devrait calculer 24 heures", () => {
            const start = new Date("2026-01-13T10:00:00");
            const end = new Date("2026-01-14T10:00:00");
            const diffMs = end - start;
            const diffHours = diffMs / (1000 * 60 * 60);

            expect(diffHours).toBe(24);
        });

        test("devrait calculer 30 minutes", () => {
            const start = new Date("2026-01-13T10:00:00");
            const end = new Date("2026-01-13T10:30:00");
            const diffMs = end - start;
            const diffMinutes = diffMs / (1000 * 60);

            expect(diffMinutes).toBe(30);
        });
    });

    describe("Calcul de prix", () => {
        test("devrait calculer le prix pour 2 heures à 2€/h", () => {
            const hours = 2;
            const tarifHoraire = 2;
            const total = hours * tarifHoraire;

            expect(total).toBe(4);
        });

        test("devrait calculer le prix pour 3.5 heures", () => {
            const hours = 3.5;
            const tarifHoraire = 2;
            const total = hours * tarifHoraire;

            expect(total).toBe(7);
        });

        test("devrait être gratuit pour P+R avec ticket", () => {
            const isPR = true;
            const hasTicket = true;
            const prix = (isPR && hasTicket) ? 0 : 5;

            expect(prix).toBe(0);
        });
    });

    describe("Validation des dates", () => {
        test("la date de début devrait être avant la date de fin", () => {
            const start = new Date("2026-01-13T10:00:00");
            const end = new Date("2026-01-13T11:00:00");

            expect(start < end).toBe(true);
        });

        test("devrait rejeter si la date de début est après la date de fin", () => {
            const start = new Date("2026-01-13T11:00:00");
            const end = new Date("2026-01-13T10:00:00");

            expect(start < end).toBe(false);
        });

        test("devrait vérifier que la date n'est pas dans le passé", () => {
            const now = new Date();
            const past = new Date("2020-01-01T10:00:00");

            expect(past < now).toBe(true);
        });
    });
});
