 // --- Configuration des Tarifs ---
        const config = {
            metz: {
                rate: 2.50,
                currency: '€',
                color: '#2980b9', // Bleu
                bg: '#d6eaf8',
                label: 'METZ - FRANCE'
            },
            londres: {
                rate: 6.00,
                currency: '£',
                color: '#c0392b', // Rouge
                bg: '#fadbd8',
                label: 'LONDON - UK'
            }
        };

        // --- Éléments du DOM ---
        const citySelect = document.getElementById('citySelect');
        const startInput = document.getElementById('startTime');
        const endInput = document.getElementById('endTime');
        const durationDisplay = document.getElementById('durationDisplay');
        const rateDisplay = document.getElementById('rateDisplay');
        const totalDisplay = document.getElementById('totalDisplay');
        const submitBtn = document.getElementById('submitBtn');
        const cityBadge = document.getElementById('cityBadge');
        const dateError = document.getElementById('dateError');

        // --- Logique de Calcul ---
        function calculatePrice() {
            const cityKey = citySelect.value;
            const startVal = startInput.value;
            const endVal = endInput.value;

            // Si tout n'est pas rempli, on arrête
            if (!cityKey || !startVal || !endVal) return;

            const start = new Date(startVal);
            const end = new Date(endVal);

            // Validation des dates
            if (end <= start) {
                dateError.style.display = 'block';
                submitBtn.disabled = true;
                totalDisplay.innerText = '---';
                return;
            } else {
                dateError.style.display = 'none';
                submitBtn.disabled = false;
            }

            // Calcul de la différence en heures
            const diffMs = end - start;
            const diffHrs = diffMs / (1000 * 60 * 60);
            
            // Formatage durée (ex: 2h 30m)
            const hours = Math.floor(diffHrs);
            const minutes = Math.round((diffHrs - hours) * 60);
            durationDisplay.innerText = `${hours}h ${minutes}m`;

            // Calcul financier
            const cityData = config[cityKey];
            const total = diffHrs * cityData.rate;

            // Affichage
            rateDisplay.innerText = `${cityData.rate.toFixed(2)} ${cityData.currency} / h`;
            totalDisplay.innerText = `${total.toFixed(2)} ${cityData.currency}`;
        }

        // --- Mise à jour visuelle (Ville) ---
        function updateCityVisuals() {
            const cityKey = citySelect.value;
            if(!cityKey) return;

            const data = config[cityKey];
            
            // Changer le badge
            cityBadge.innerText = data.label;
            cityBadge.style.backgroundColor = data.bg;
            cityBadge.style.color = data.color;

            // Relancer le calcul si les dates sont déjà là
            calculatePrice();
        }

        // --- Écouteurs d'événements ---
        citySelect.addEventListener('change', updateCityVisuals);
        startInput.addEventListener('change', calculatePrice);
        endInput.addEventListener('change', calculatePrice);

        // --- Simulation d'envoi ---
        submitBtn.addEventListener('click', () => {
            const city = citySelect.value;
            const price = totalDisplay.innerText;
            
            // Ici, vous feriez l'appel API vers votre backend Python/PHP
            alert(`Réservation confirmée pour ${city.toUpperCase()} !\nMontant à payer : ${price}\n\n(Données envoyées au serveur...)`);
        });
