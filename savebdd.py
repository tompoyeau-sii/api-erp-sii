import subprocess
import datetime
import os
import sys

# Obtenez la date et l'heure actuelles
now = datetime.datetime.now()
date_heure = now.strftime("%Y-%m-%d_%H-%M-%S")

# Nom du fichier de sauvegarde basé sur la date et l'heure
nom_fichier_sauvegarde = f"D:\\Users\\tom.poyeau\\Documents\\Projets\\ERP-SII\\saveBDD\\sauvegarde_picsou_{date_heure}.sql"

# Chemin complet vers pg_dump et psql
chemin_pg_dump = f"C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe"
chemin_psql = f"C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe"

mot_de_passe = "root"
os.environ["PGPASSWORD"] = mot_de_passe

# Exécute la commande pour exporter les données de la base de données A
with open(nom_fichier_sauvegarde, 'w') as file:
    subprocess.run([chemin_pg_dump, "-U", "postgres", "-d", "picsou"], stdout=file, shell=True)

# Créez la base de données B avec le même schéma
# Assurez-vous que la base de données B a déjà été créée avec le même schéma que la base de données A

subprocess.run([chemin_psql, "-U", "postgres", "-d", "picsou-simulation", "-c", "DROP SCHEMA IF EXISTS public CASCADE"])

subprocess.run([chemin_psql, "-U", "postgres", "-d", "picsou-simulation", "-c", "CREATE SCHEMA public"])
# Exécute la commande pour importer les données dans la base de données B
subprocess.run([chemin_psql, "-U", "postgres", "-d", "picsou-simulation", "-f", nom_fichier_sauvegarde], shell=True)

print(f"Transfert de données réussi ! Fichier de sauvegarde : {nom_fichier_sauvegarde}")

sys.exit();