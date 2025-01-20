# Pizza Dough Calculator 🍕

O aplicație web care te ajută să calculezi cantitatea de cocă necesară pentru ziua următoare, bazată pe istoricul vânzărilor.

## Despre Aplicație

Pizza Dough Calculator este un instrument esențial pentru pizzerii, ajutându-te să:
- Prezici numărul de pizza-uri pentru ziua următoare
- Calculezi exact câte batch-uri de cocă trebuie să pregătești
- Urmărești tendințele vânzărilor
- Gestionezi eficient stocul de cocă

## Cum Funcționează

### Calculul Batch-urilor
- 1 batch = 90 pizza mici
- Conversie automată în echivalent pizza mică:
  - 1 pizza mică = 1 unitate
  - 1 pizza medie = 2 unități
  - 1 pizza mare = 3 unități
  - 1 pizza extra large = 4 unități

### Predicții Inteligente
- Folosește datele din ultimele 3 săptămâni
- Acordă mai multă importanță datelor recente:
  - 50% ultima săptămână
  - 30% penultima săptămână
  - 20% antepenultima săptămână
- Adaugă automat un factor de siguranță de 10%

## Caracteristici

- 📊 Predicții precise pentru fiecare tip și mărime de pizza
- 📈 Urmărirea tendințelor vânzărilor
- 📅 Istoric detaliat al vânzărilor
- 💾 Salvare automată a datelor
- 🔄 Actualizare în timp real

## Cum să Începi

1. Introdu datele zilnice de vânzări
2. Selectează ziua pentru care dorești predicția
3. Apasă pe "Generează" pentru a vedea rezultatele
4. Verifică numărul de batch-uri necesare și tendințele

## Tehnologii Folosite

- Frontend: HTML, CSS, JavaScript
- Backend: PHP
- Bază de date: MySQL
- Stocare locală pentru backup

## Instalare

1. Clonează repository-ul
2. Configurează baza de date MySQL
3. Actualizează credențialele în `api/config/database.php`
4. Rulează aplicația pe un server web (Apache/Nginx)

## Contribuții

Contribuțiile sunt binevenite! Dacă ai sugestii de îmbunătățiri:
1. Fork acest repository
2. Creează un branch nou
3. Fă modificările dorite
4. Trimite un pull request

## Contact

Pentru întrebări și suport, contactează-ne la [email@example.com]

## Licență

Acest proiect este licențiat sub [MIT License](LICENSE) 