#!/bin/bash

# Enregistrer le temps de début
START_TIME=$(date +%s)

echo "========================================"
echo "Test Multiple API Calls"
echo "========================================"
echo ""

# Demander le nombre d'appels
read -p "Combien d'appels simultanés voulez-vous simuler? (1-10): " NUM_CALLS

# Valider l'entrée
if [[ ! "$NUM_CALLS" =~ ^[0-9]+$ ]] || [ "$NUM_CALLS" -lt 1 ]; then
    NUM_CALLS=1
fi
if [ "$NUM_CALLS" -gt 10 ]; then
    NUM_CALLS=10
fi

echo ""
echo "Lancement de $NUM_CALLS appels simultanés..."
echo ""

# Déterminer le chemin du fichier audio
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDIO_FILE="$SCRIPT_DIR/sample.wav"

# Vérifier que le fichier audio existe
if [ ! -f "$AUDIO_FILE" ]; then
    echo "ERREUR: Le fichier audio n'existe pas: $AUDIO_FILE"
    exit 1
fi

echo "Utilisation du fichier audio: $AUDIO_FILE"
echo ""

# Tableaux pour stocker les données
declare -a GAMES=("" "Just Chatting" "League of Legends" "Valorant" "Minecraft" "Fortnite" "Counter-Strike" "Dota 2" "Apex Legends" "Overwatch" "Call of Duty")
declare -a LANGUAGES=("" "en" "fr" "en" "fr" "en" "fr" "en" "fr" "en" "fr")
declare -a TASK_IDS
declare -a LAST_STATUS
declare -a TASK_DONE
declare -a TASK_START_TIME
declare -a TASK_END_TIME

# Lancer tous les appels
SEND_START=$(date +%s)
for ((i=1; i<=NUM_CALLS; i++)); do
    echo "[Test $i] Envoi du fichier audio..."
    TASK_START_TIME[$i]=$(date +%s)

    LANG="${LANGUAGES[$i]}"
    GAME="${GAMES[$i]}"

    response=$(curl -s -X POST http://localhost:5000/summarize/ \
        -F "audio=@$AUDIO_FILE" \
        -F "streamer=Streamer$i" \
        -F "language=$LANG" \
        -F "game=$GAME" \
        -F "time=00:15:30" \
        -F "title=Stream title test $i" 2>&1)

    # Debug: afficher la réponse si elle contient une erreur
    if echo "$response" | grep -q "error\|Error\|curl:"; then
        echo "  ! Erreur lors de l'envoi: $response"
    fi

    # Extraire le task_id avec jq si disponible, sinon avec grep/sed
    if command -v jq &> /dev/null; then
        TASK_ID=$(echo "$response" | jq -r '.task_id' 2>/dev/null)
    else
        TASK_ID=$(echo "$response" | grep -o '"task_id":"[^"]*"' | sed 's/"task_id":"\(.*\)"/\1/' | head -1)
    fi

    # Si le task_id est vide, essayer d'extraire autrement
    if [ -z "$TASK_ID" ] || [ "$TASK_ID" == "null" ]; then
        # Peut-être que la réponse est sur une ligne
        TASK_ID=$(echo "$response" | sed -n 's/.*"task_id":"\([^"]*\)".*/\1/p' | head -1)
    fi

    TASK_IDS[$i]="$TASK_ID"
    LAST_STATUS[$i]="unknown"
    TASK_DONE[$i]=0

    if [ -z "$TASK_ID" ]; then
        echo "  > Task ID $i: [ERREUR - Pas de task_id reçu]"
        echo "  > Réponse brute: $response"
    else
        echo "  > Task ID $i: $TASK_ID"
    fi
done

SEND_END=$(date +%s)
SEND_DURATION=$((SEND_END - SEND_START))

echo ""
echo "Temps pour envoyer tous les appels: ${SEND_DURATION}s"
echo "Attente de 2 secondes avant de vérifier les statuts..."
sleep 2
echo ""

# Boucle de vérification des statuts
echo "========================================"
echo "Vérification des statuts (affichage uniquement des changements)"
echo "========================================"
echo ""

RETRY_COUNT=0
MAX_RETRIES=50
LAST_DONE_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    RETRY_COUNT=$((RETRY_COUNT + 1))

    # Vérifier chaque tâche
    for ((i=1; i<=NUM_CALLS; i++)); do
        if [ "${TASK_DONE[$i]}" -eq 0 ]; then
            # Récupérer le statut actuel
            status_response=$(curl -s "http://localhost:5000/summarize/status/${TASK_IDS[$i]}")

            # Extraire le statut et current_step
            if command -v jq &> /dev/null; then
                CURRENT_STATUS=$(echo "$status_response" | jq -r '.status')
                CURRENT_STEP=$(echo "$status_response" | jq -r '.current_step')
                ERROR_MSG=$(echo "$status_response" | jq -r '.error // empty')
            else
                CURRENT_STATUS=$(echo "$status_response" | grep -o '"status":"[^"]*"' | sed 's/"status":"\(.*\)"/\1/')
                CURRENT_STEP=$(echo "$status_response" | grep -o '"current_step":"[^"]*"' | sed 's/"current_step":"\(.*\)"/\1/')
                ERROR_MSG=$(echo "$status_response" | grep -o '"error":"[^"]*"' | sed 's/"error":"\(.*\)"/\1/')
            fi

            # Vérifier si le statut a changé
            COMBINED_STATUS="$CURRENT_STATUS$CURRENT_STEP"
            if [ "$COMBINED_STATUS" != "${LAST_STATUS[$i]}" ]; then
                echo "[Task $i] Status: $CURRENT_STATUS - Step: $CURRENT_STEP"

                # Afficher l'erreur si présente
                if [ -n "$ERROR_MSG" ]; then
                    echo "  > ERROR: $ERROR_MSG"
                fi

                LAST_STATUS[$i]="$COMBINED_STATUS"
            fi

            # Marquer comme terminé si done ou error
            if [ "$CURRENT_STATUS" == "done" ] || [ "$CURRENT_STATUS" == "error" ]; then
                TASK_DONE[$i]=1
                TASK_END_TIME[$i]=$(date +%s)
                TASK_DURATION=$((TASK_END_TIME[$i] - TASK_START_TIME[$i]))
                echo "  ⏱️  Durée totale: ${TASK_DURATION}s"
            fi
        fi
    done

    # Vérifier si toutes les tâches sont terminées
    ALL_DONE=1
    DONE_COUNT=0
    for ((i=1; i<=NUM_CALLS; i++)); do
        if [ "${TASK_DONE[$i]}" -eq 0 ]; then
            ALL_DONE=0
        else
            DONE_COUNT=$((DONE_COUNT + 1))
        fi
    done

    # Afficher la progression uniquement si elle a changé
    if [ $DONE_COUNT -ne $LAST_DONE_COUNT ]; then
        echo "[Progress: $DONE_COUNT/$NUM_CALLS tâches terminées]"
        echo ""
        LAST_DONE_COUNT=$DONE_COUNT
    fi

    if [ $ALL_DONE -eq 1 ]; then
        echo ""
        echo "========================================"
        echo "Toutes les tâches sont terminées!"
        echo "========================================"
        break
    fi

    sleep 3
done

if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo ""
    echo "========================================"
    echo "Temps maximum atteint - Arrêt de la surveillance"
    echo "========================================"
fi

# Affichage des résultats finaux
echo ""
echo "Affichage des résultats finaux:"
echo ""

for ((i=1; i<=NUM_CALLS; i++)); do
    echo "----------------------------------------"
    echo "Task $i - Final Status:"
    curl -s "http://localhost:5000/summarize/status/${TASK_IDS[$i]}" | jq '.' 2>/dev/null || curl -s "http://localhost:5000/summarize/status/${TASK_IDS[$i]}"
    echo ""
done

echo "========================================"
echo "Test terminé!"
echo "========================================"

# Calculer et afficher le temps total
END_TIME=$(date +%s)
TOTAL_DURATION=$((END_TIME - START_TIME))
MINUTES=$((TOTAL_DURATION / 60))
SECONDS=$((TOTAL_DURATION % 60))

echo ""
echo "📊 Statistiques de temps:"
echo "  - Temps d'envoi des appels: ${SEND_DURATION}s"
echo "  - Temps total d'exécution: ${MINUTES}m ${SECONDS}s"
echo ""

# Afficher le temps par tâche et calculer les statistiques
echo "⏱️  Temps par tâche:"
MIN_TIME=999999
MAX_TIME=0
TOTAL_TASK_TIME=0
COMPLETED_TASKS=0

for ((i=1; i<=NUM_CALLS; i++)); do
    if [ -n "${TASK_END_TIME[$i]}" ]; then
        TASK_DURATION=$((TASK_END_TIME[$i] - TASK_START_TIME[$i]))
        echo "  - Task $i: ${TASK_DURATION}s"

        # Calculer min/max/moyenne
        COMPLETED_TASKS=$((COMPLETED_TASKS + 1))
        TOTAL_TASK_TIME=$((TOTAL_TASK_TIME + TASK_DURATION))

        if [ $TASK_DURATION -lt $MIN_TIME ]; then
            MIN_TIME=$TASK_DURATION
        fi

        if [ $TASK_DURATION -gt $MAX_TIME ]; then
            MAX_TIME=$TASK_DURATION
        fi
    else
        echo "  - Task $i: Non terminée"
    fi
done

echo ""

# Afficher les statistiques détaillées
if [ $COMPLETED_TASKS -gt 0 ]; then
    AVG_TIME=$((TOTAL_TASK_TIME / COMPLETED_TASKS))

    echo "📈 Statistiques détaillées:"
    echo "  - Tâches complétées: $COMPLETED_TASKS/$NUM_CALLS"
    echo "  - Temps moyen par tâche: ${AVG_TIME}s"
    echo "  - Tâche la plus rapide: ${MIN_TIME}s"
    echo "  - Tâche la plus lente: ${MAX_TIME}s"

    if [ $COMPLETED_TASKS -gt 1 ]; then
        VARIANCE=$((MAX_TIME - MIN_TIME))
        echo "  - Écart entre min et max: ${VARIANCE}s"
    fi
    echo ""
fi
