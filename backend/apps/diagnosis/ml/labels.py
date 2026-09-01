"""
PlantVillage 38 Classes Mapping with detailed agronomic data in Spanish.
"""

PLANT_CLASSES = [
    {
        "id": 0,
        "raw_label": "Apple___Apple_scab",
        "crop": "Manzano",
        "common_name": "Sarna del Manzano / Moteado",
        "scientific_name": "Venturia inaequalis",
        "is_healthy": False,
        "severity": "Moderada",
        "symptoms": "Manchas aterciopeladas de color verde oliva a marrón oscuro en hojas y frutos.",
        "recommended_action": "Aplicar fungicidas a base de cobre o captan. Retirar hojas secas del suelo para evitar reinfección."
    },
    {
        "id": 1,
        "raw_label": "Apple___Black_rot",
        "crop": "Manzano",
        "common_name": "Podredumbre Negra del Manzano",
        "scientific_name": "Botryosphaeria obtusa",
        "is_healthy": False,
        "severity": "Alta",
        "symptoms": "Manchas circulares marrones en hojas tipo ojo de rana y frutos momificados.",
        "recommended_action": "Podar ramas infectadas y desinfectar herramientas con alcohol al 70%. Aplicar fungicida específico."
    },
    {
        "id": 2,
        "raw_label": "Apple___Cedar_apple_rust",
        "crop": "Manzano",
        "common_name": "Roya del Manzano",
        "scientific_name": "Gymnosporangium juniperi-virginianae",
        "is_healthy": False,
        "severity": "Media",
        "symptoms": "Manchas amarillo-anaranjadas brillantes en el haz de las hojas.",
        "recommended_action": "Aplicar fungicidas triazoles en primavera antes de la floración."
    },
    {
        "id": 3,
        "raw_label": "Apple___healthy",
        "crop": "Manzano",
        "common_name": "Manzano Saludable",
        "scientific_name": "Malus domestica (Healthy)",
        "is_healthy": True,
        "severity": "Ninguna",
        "symptoms": "Follaje verde vigoroso, sin manchas ni deformaciones foliares.",
        "recommended_action": "Mantener régimen preventivo de riego y fertilización equilibrada con potasio y fósforo."
    },
    {
        "id": 4,
        "raw_label": "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
        "crop": "Maíz",
        "common_name": "Mancha Gris Foliar del Maíz",
        "scientific_name": "Cercospora zeae-maydis",
        "is_healthy": False,
        "severity": "Alta",
        "symptoms": "Lesiones rectangulares alargadas delimitadas por las nervaduras de color gris o canela.",
        "recommended_action": "Rotación de cultivos y aplicación de fungicidas con estrobirulinas."
    },
    {
        "id": 5,
        "raw_label": "Corn_(maize)___Common_rust_",
        "crop": "Maíz",
        "common_name": "Roya Común del Maíz",
        "scientific_name": "Puccinia sorghi",
        "is_healthy": False,
        "severity": "Moderada",
        "symptoms": "Pústulas pulverulentas de color marrón canela en ambas caras de las hojas.",
        "recommended_action": "Monitoreo temprano. En infestación superior al 15%, aplicar fungicida sistémico."
    },
    {
        "id": 6,
        "raw_label": "Corn_(maize)___Northern_Leaf_Blight",
        "crop": "Maíz",
        "common_name": "Tizón Foliar del Norte",
        "scientific_name": "Exserohilum turcicum",
        "is_healthy": False,
        "severity": "Alta",
        "symptoms": "Grandes lesiones alargadas con forma de huso de color grisáceo o pajizo.",
        "recommended_action": "Evitar exceso de humedad foliar y usar variedades resistentes en la próxima siembra."
    },
    {
        "id": 7,
        "raw_label": "Corn_(maize)___healthy",
        "crop": "Maíz",
        "common_name": "Maíz Saludable",
        "scientific_name": "Zea mays (Healthy)",
        "is_healthy": True,
        "severity": "Ninguna",
        "symptoms": "Hojas lanceoladas verdes y limpias sin presencia de pústulas ni lesiones.",
        "recommended_action": "Monitoreo semanal del estado del nitrógeno y riego oportuno durante la floración."
    },
    {
        "id": 8,
        "raw_label": "Grape___Black_rot",
        "crop": "Vid / Uva",
        "common_name": "Podredumbre Negra de la Vid",
        "scientific_name": "Guignardia bidwellii",
        "is_healthy": False,
        "severity": "Alta",
        "symptoms": "Manchas rojizas en hojas con puntos negros diminutos (picnidios) y bayas arrugadas.",
        "recommended_action": "Poda de aclareo para mejorar aireación y aplicaciones tempranas de miclobutanil."
    },
    {
        "id": 9,
        "raw_label": "Grape___healthy",
        "crop": "Vid / Uva",
        "common_name": "Vid Saludable",
        "scientific_name": "Vitis vinifera (Healthy)",
        "is_healthy": True,
        "severity": "Ninguna",
        "symptoms": "Pámpanos y racimos vigorosos con hojas uniformes y libres de clorosis.",
        "recommended_action": "Mantener poda de ventilación y control biológico preventivo."
    },
    {
        "id": 10,
        "raw_label": "Pepper__bell___Bacterial_spot",
        "crop": "Pimiento / Ají",
        "common_name": "Mancha Bacteriana del Pimiento",
        "scientific_name": "Xanthomonas campestris pv. vesicatoria",
        "is_healthy": False,
        "severity": "Alta",
        "symptoms": "Pequeñas manchas oscuras con halo amarillento en el envés de la hoja.",
        "recommended_action": "Evitar riego por aspersión. Aplicar bactericidas cúpricos combinados con mancozeb."
    },
    {
        "id": 11,
        "raw_label": "Pepper__bell___healthy",
        "crop": "Pimiento / Ají",
        "common_name": "Pimiento Saludable",
        "scientific_name": "Capsicum annuum (Healthy)",
        "is_healthy": True,
        "severity": "Ninguna",
        "symptoms": "Hojas verde oscuro brillantes, sin clorosis ni necrosis marginal.",
        "recommended_action": "Mantener humedad constante en suelo sin encharcamiento y fertilización con calcio."
    },
    {
        "id": 12,
        "raw_label": "Potato___Early_blight",
        "crop": "Papa",
        "common_name": "Tizón Temprano de la Papa",
        "scientific_name": "Alternaria solani",
        "is_healthy": False,
        "severity": "Moderada",
        "symptoms": "Manchas circulares marrones con anillos concéntricos concéntricos (diana).",
        "recommended_action": "Aplicar fungicida protectante (Clorotalonil) o sistémico (Azoxistrobina)."
    },
    {
        "id": 13,
        "raw_label": "Potato___Late_blight",
        "crop": "Papa",
        "common_name": "Tizón Tardío / Rancha de la Papa",
        "scientific_name": "Phytophthora infestans",
        "is_healthy": False,
        "severity": "Muy Alta / Crítica",
        "symptoms": "Manchas oscuras húmedas con vellosidad blanca en el envés bajo alta humedad.",
        "recommended_action": "Acción urgente: Aplicar Metalaxil o Cimoxanilo. Destruir plantas gravemente infectadas."
    },
    {
        "id": 14,
        "raw_label": "Potato___healthy",
        "crop": "Papa",
        "common_name": "Papa Saludable",
        "scientific_name": "Solanum tuberosum (Healthy)",
        "is_healthy": True,
        "severity": "Ninguna",
        "symptoms": "Follaje denso y verde sin signos de tizón ni enrollamiento foliar.",
        "recommended_action": "Monitoreo constante de humedad ambiental para prevenir aparición de Rancha."
    },
    {
        "id": 15,
        "raw_label": "Tomato___Bacterial_spot",
        "crop": "Tomate",
        "common_name": "Mancha Bacteriana del Tomate",
        "scientific_name": "Xanthomonas perforans",
        "is_healthy": False,
        "severity": "Alta",
        "symptoms": "Manchas negras angulares rodeadas de halos amarillos en hojas y peciolos.",
        "recommended_action": "Aplicar hidróxido de cobre + oxicloruro de cobre. Desinfectar podaderas."
    },
    {
        "id": 16,
        "raw_label": "Tomato___Early_blight",
        "crop": "Tomate",
        "common_name": "Tizón Temprano del Tomate",
        "scientific_name": "Alternaria linariae",
        "is_healthy": False,
        "severity": "Moderada",
        "symptoms": "Manchas necróticas con anillos concéntricos empezando en hojas basales.",
        "recommended_action": "Podar hojas inferiores en contacto con el suelo. Aplicar difenoconazol."
    },
    {
        "id": 17,
        "raw_label": "Tomato___Late_blight",
        "crop": "Tomate",
        "common_name": "Tizón Tardío del Tomate",
        "scientific_name": "Phytophthora infestans",
        "is_healthy": False,
        "severity": "Muy Alta",
        "symptoms": "Grandes manchas verdes grisáceas de aspecto grasiento que se tornan marrones rápidamente.",
        "recommended_action": "Tratamiento fungicida de choque con fosetil-aluminio o dimetomorf."
    },
    {
        "id": 18,
        "raw_label": "Tomato___Leaf_Mold",
        "crop": "Tomate",
        "common_name": "Moho Foliar del Tomate",
        "scientific_name": "Passalora fulva",
        "is_healthy": False,
        "severity": "Media",
        "symptoms": "Manchas amarillentas en haz y moho aterciopelado verde oliva a grisáceo en envés.",
        "recommended_action": "Aumentar ventilación en invernadero y reducir humedad relativa por debajo del 85%."
    },
    {
        "id": 19,
        "raw_label": "Tomato___Septoria_leaf_spot",
        "crop": "Tomate",
        "common_name": "Mancha Foliar por Septoria",
        "scientific_name": "Septoria lycopersici",
        "is_healthy": False,
        "severity": "Moderada",
        "symptoms": "Múltiples manchas circulares pequeñas con centro grisáceo y borde oscuro.",
        "recommended_action": "Eliminar hojas afectadas y aplicar fungicida a base de azufre o clorotalonil."
    },
    {
        "id": 20,
        "raw_label": "Tomato___Spider_mites Two-spotted_spider_mite",
        "crop": "Tomate",
        "common_name": "Araña Roja / Ácaro de Dos Manchas",
        "scientific_name": "Tetranychus urticae",
        "is_healthy": False,
        "severity": "Alta",
        "symptoms": "Punteado amarillento fino en hojas y finas telarañas en brotes y envés.",
        "recommended_action": "Aplicar acaricida biológico (aceite de neem o jabón potásico) o abamectina."
    },
    {
        "id": 21,
        "raw_label": "Tomato___Target_Spot",
        "crop": "Tomate",
        "common_name": "Mancha Diana del Tomate",
        "scientific_name": "Corynespora cassiicola",
        "is_healthy": False,
        "severity": "Media",
        "symptoms": "Lesiones marrones con centros claros concéntricos en hojas y tallos.",
        "recommended_action": "Aplicar boscalid o pyraclostrobin y mejorar circulación de aire."
    },
    {
        "id": 22,
        "raw_label": "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
        "crop": "Tomate",
        "common_name": "Virus del Rizado Amarillo del Tomate (TYLCV)",
        "scientific_name": "Tomato yellow leaf curl virus (Begomovirus)",
        "is_healthy": False,
        "severity": "Muy Alta / Viral",
        "symptoms": "Amarillamiento internerval severo, hojas encrespadas hacia arriba y enanismo.",
        "recommended_action": "Control estricto del vector (Mosca Blanca - Bemisia tabaci). No hay cura química para el virus."
    },
    {
        "id": 23,
        "raw_label": "Tomato___Tomato_mosaic_virus",
        "crop": "Tomate",
        "common_name": "Virus del Mosaico del Tomate (ToMV)",
        "scientific_name": "Tomato mosaic tobamovirus",
        "is_healthy": False,
        "severity": "Alta / Viral",
        "symptoms": "Patrón de mosaico verde claro y verde oscuro con deformación de hojas.",
        "recommended_action": "Desinfectar manos y ropa tras manipular plantas. Eliminar plantas enfermas inmediatamente."
    },
    {
        "id": 24,
        "raw_label": "Tomato___healthy",
        "crop": "Tomate",
        "common_name": "Tomate Saludable",
        "scientific_name": "Solanum lycopersicum (Healthy)",
        "is_healthy": True,
        "severity": "Ninguna",
        "symptoms": "Hojas compuestas turgentes y verdes, sin clorosis ni decoloración.",
        "recommended_action": "Mantener entutorado adecuado, riego por goteo y monitoreo preventivo de plagas."
    },
    {
        "id": 25,
        "raw_label": "Coffee___Rust",
        "crop": "Café",
        "common_name": "Roya del Cafeto",
        "scientific_name": "Hemileia vastatrix",
        "is_healthy": False,
        "severity": "Crítica",
        "symptoms": "Polvo amarillo o naranja brillante en el envés de las hojas maduras.",
        "recommended_action": "Aplicar fungicida sistémico a base de Cyproconazole o Triadimenol. Poda sanitaria."
    },
    {
        "id": 26,
        "raw_label": "Coffee___healthy",
        "crop": "Café",
        "common_name": "Café Saludable",
        "scientific_name": "Coffea arabica (Healthy)",
        "is_healthy": True,
        "severity": "Ninguna",
        "symptoms": "Hojas elípticas verde oscuro brillantes con ramas productivas vigorosas.",
        "recommended_action": "Manejo de sombra adecuado y nutrición foliar con zinc y boro."
    }
]

def get_class_by_id(class_id: int):
    if 0 <= class_id < len(PLANT_CLASSES):
        return PLANT_CLASSES[class_id]
    return PLANT_CLASSES[24]  # default fallback to tomato healthy

def get_class_by_label(label: str):
    for item in PLANT_CLASSES:
        if item["raw_label"].lower() == label.lower():
            return item
    return PLANT_CLASSES[24]
