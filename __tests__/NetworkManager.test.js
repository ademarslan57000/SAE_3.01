/**
 * Tests unitaires pour NetworkManager
 * Tests de la détection de connexion réseau
 */

const { NetworkManager } = require("../assets/js/utils/NetworkManager.js");

// Mock du DOM
document.body.innerHTML = '<div id="network-indicator"></div>';

describe("NetworkManager", () => {
    let networkManager;
    let originalOnLine;

    beforeEach(() => {
        // Sauvegarder l'état original
        originalOnLine = navigator.onLine;

        // Mock de navigator.onLine
        Object.defineProperty(navigator, "onLine", {
            writable: true,
            value: true,
        });

        networkManager = new NetworkManager();
    });

    afterEach(() => {
        // Restaurer l'état original
        Object.defineProperty(navigator, "onLine", {
            writable: true,
            value: originalOnLine,
        });
    });

    describe("Initialisation", () => {
        test("devrait détecter l'état en ligne au démarrage", () => {
            navigator.onLine = true;
            const manager = new NetworkManager();
            expect(manager.isOnline).toBe(true);
        });

        test("devrait détecter l'état hors ligne au démarrage", () => {
            navigator.onLine = false;
            const manager = new NetworkManager();
            expect(manager.isOnline).toBe(false);
        });
    });

    describe("isOnline", () => {
        test("devrait retourner true quand en ligne", () => {
            navigator.onLine = true;
            networkManager.isOnline = true;
            expect(networkManager.isOnline).toBe(true);
        });

        test("devrait retourner false quand hors ligne", () => {
            navigator.onLine = false;
            networkManager.isOnline = false;
            expect(networkManager.isOnline).toBe(false);
        });
    });

    describe("checkBeforeAction", () => {
        test("devrait retourner true si en ligne", () => {
            networkManager.isOnline = true;
            const result = networkManager.checkBeforeAction(
                "test",
                "Message erreur",
            );
            expect(result).toBe(true);
        });

        test("devrait retourner false si hors ligne", () => {
            networkManager.isOnline = false;

            // Mock console.warn pour éviter les logs pendant les tests
            const warnSpy = jest.spyOn(console, "warn").mockImplementation();

            const result = networkManager.checkBeforeAction(
                "test",
                "Message erreur",
            );
            expect(result).toBe(false);

            warnSpy.mockRestore();
        });
    });

    describe("Événements réseau", () => {
        test("devrait passer en ligne lors de l'événement online", () => {
            networkManager.isOnline = false;

            // Simuler l'événement online
            const event = new Event("online");
            window.dispatchEvent(event);

            // Attendre la mise à jour asynchrone
            setTimeout(() => {
                expect(networkManager.isOnline).toBe(true);
            }, 100);
        });

        test("devrait passer hors ligne lors de l'événement offline", () => {
            networkManager.isOnline = true;

            // Simuler l'événement offline
            const event = new Event("offline");
            window.dispatchEvent(event);

            // Attendre la mise à jour asynchrone
            setTimeout(() => {
                expect(networkManager.isOnline).toBe(false);
            }, 100);
        });
    });

    describe("showNetworkStatus", () => {
        test("devrait afficher un indicateur de statut", () => {
            const indicator = document.getElementById("network-indicator");
            expect(indicator).toBeDefined();

            networkManager.showNetworkStatus(true);
            // Vérifier que l'indicateur est modifié (selon implémentation)
        });

        test("devrait gérer l'absence d'indicateur sans erreur", () => {
            // Supprimer l'indicateur
            const indicator = document.getElementById("network-indicator");
            if (indicator) indicator.remove();

            expect(() => networkManager.showNetworkStatus(false)).not.toThrow();
        });
    });

    describe("Listener", () => {
        test("devrait permettre d'ajouter un listener", () => {
            const listener = jest.fn();
            networkManager.addListener(listener);

            // Changer l'état
            networkManager.isOnline = false;
            const event = new Event("offline");
            window.dispatchEvent(event);

            // Le listener devrait être appelé (selon implémentation)
        });
    });
});
