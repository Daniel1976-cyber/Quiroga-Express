import pandas as pd
import json

try:
    # Leer el archivo Excel
    df = pd.read_excel('mercy.xlsx')
    
    # Mostrar las columnas para verificar
    print("Columnas encontradas:", df.columns.tolist())
    
    # Convertir a JSON (lista de diccionarios)
    json_str = df.to_json(orient='records', force_ascii=False)
    
    # Guardar en un archivo
    with open('mercy.json', 'w', encoding='utf-8') as f:
        f.write(json_str)
        
    print("Archivo mercy.json creado exitosamente.")
except Exception as e:
    print("Error:", e)
