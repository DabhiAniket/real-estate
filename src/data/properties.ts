export interface Property {
  slug: string;
  title: string;
  tagline: string;
  category: 'residential' | 'commercial' | 'land';
  propertyType: string;
  location: string;
  price: string;
  area: string;
  bedrooms?: number;
  bathrooms?: number;
  yearBuilt: string;
  architect: string;
  materials: string[];
  image: string;
  gallery: string[];
  description: string;
  blueprintImage?: string;
  highlights: { label: string; value: string }[];
  specifications: { [key: string]: string };
  isFeatured?: boolean;
}

export const PROPERTIES: Property[] = [
  {
    slug: "the-ravine-villa",
    title: "The Ravine Residence",
    tagline: "Cantilevered concrete, soft copper louvers, and seamless indoor-outdoor living.",
    category: "residential",
    propertyType: "Architectural Villa",
    location: "Alibaug Coastline, Maharashtra",
    price: "₹42,50,00,000",
    area: "11,500 sq ft",
    bedrooms: 5,
    bathrooms: 7,
    yearBuilt: "2024",
    architect: "Studio Architecture & Partner Architects",
    materials: ["Charcoal Architectural Concrete", "Soft Copper Louvers", "Travertine Stone", "Low-Iron Acoustic Glass"],
    image: "/images/hero_villa.jpg",
    gallery: [
      "/images/hero_villa.jpg",
      "/images/interior_reveal.jpg",
      "/images/property_blueprint.jpg"
    ],
    blueprintImage: "/images/property_blueprint.jpg",
    description: "Designed as an organic dialogue between monolithic charcoal concrete and refined soft copper louvers, The Ravine Residence sits perched above a natural coastal incline. The upper level cantilevers six meters over the stone courtyard, creating a dramatic shaded terrace and a natural thermal buffer. Double-height acoustic glass panels dissolve the distinction between the curated interior pavilion and the private reflecting pool.",
    highlights: [
      { label: "Plot Area", value: "32,000 sq ft" },
      { label: "Built-up Area", value: "11,500 sq ft" },
      { label: "Structural Framing", value: "Post-tensioned Cantilever Slab" },
      { label: "Orientation", value: "West-facing Natural Sunset Aspect" },
      { label: "Pool", value: "22m Black Granite Mirror Basin" },
      { label: "Energy Standard", value: "Passive Thermal Shielding & Solar Roof" }
    ],
    specifications: {
      "Structure": "Reinforced charcoal concrete with post-tensioned spans",
      "Envelope": "Thermally broken architectural copper mullions with triple-pane glazing",
      "Flooring": "Custom 1200x1200mm honed Italian travertine",
      "Joinery": "Charred cedar and brushed soft copper cabinetry",
      "Climate": "Integrated geothermal sub-floor cooling and HEPA filtration",
      "Parking": "Subterranean 4-bay secure climate-controlled garage"
    },
    isFeatured: true
  },
  {
    slug: "aurora-sky-penthouse",
    title: "Aurora Duplex Penthouse",
    tagline: "Suspended architectural sanctuary with panoramic ocean and skyline views.",
    category: "residential",
    propertyType: "Duplex Penthouse",
    location: "Worli Sea Face, Mumbai",
    price: "₹38,00,000,000",
    area: "8,200 sq ft",
    bedrooms: 4,
    bathrooms: 5,
    yearBuilt: "2024",
    architect: "Bespoke High-Rise Atelier",
    materials: ["Dark Honed Granite", "Soft Copper Balustrades", "Acoustic Glazing", "Custom Fluted Wall Panels"],
    image: "/images/property_res_penthouse.jpg",
    gallery: [
      "/images/property_res_penthouse.jpg",
      "/images/interior_reveal.jpg",
      "/images/property_blueprint.jpg"
    ],
    blueprintImage: "/images/property_blueprint.jpg",
    description: "Occupying the 48th and 49th floors, Aurora is an exercise in atmospheric restraint. A double-height glass cube framed in copper-toned mullions commands unbroken ocean horizon vistas. The private rooftop deck features an elevated glass-edge plunge pool, an outdoor hearth, and sculpted lounge zones sheltered from offshore winds.",
    highlights: [
      { label: "Level", value: "Floors 48 & 49" },
      { label: "Terrace Deck", value: "2,400 sq ft Private Rooftop" },
      { label: "Ceiling Height", value: "6.8m Double-Height Great Room" },
      { label: "Elevator", value: "Direct Keycard Biometric Access" },
      { label: "Wellness", value: "Private Sauna, Steam & Cold Plunge" },
      { label: "Acoustics", value: "STC 55 Certified Acoustic Envelope" }
    ],
    specifications: {
      "Glass": "Hurricane-rated 32mm insulated solar-control laminate",
      "Finishes": "Hand-rubbed linen wall dressings and smoked oak parquetry",
      "Terrace": "Engineered composite stone with concealed perimeter drains",
      "Automation": "Lutron Palladiom architectural lighting and HVAC control",
      "Security": "Multi-tier biometric lobby and private shaft access"
    },
    isFeatured: true
  },
  {
    slug: "solis-commercial-headquarters",
    title: "Solis Corporate Headquarters",
    tagline: "Grade-A sustainable corporate campus with vertical copper solar fins.",
    category: "commercial",
    propertyType: "Grade-A Commercial Campus",
    location: "Bandra-Kurla Complex (BKC), Mumbai",
    price: "Price on Application",
    area: "145,000 sq ft",
    yearBuilt: "2023",
    architect: "Atelier Commercial Architecture",
    materials: ["Architectural Concrete Exoskeleton", "Soft Copper Solar Fins", "Low-E Glazing", "Indigenous Stone Paving"],
    image: "/images/property_comm_hq.jpg",
    gallery: [
      "/images/property_comm_hq.jpg",
      "/images/property_comm_retail.jpg"
    ],
    description: "Solis redefines the corporate workplace by fusing structural efficiency with environmental stewardship. The building's exoskeleton of charcoal architectural concrete supports slender, precision-angled soft copper fins that reduce solar heat gain by 42% while preserving abundant natural daylight. A landscaped biophilic ground piazza welcomes occupants with indigenous flora and stone pathways.",
    highlights: [
      { label: "Total Built Area", value: "145,000 sq ft" },
      { label: "Floor Plates", value: "18,000 sq ft Column-Free Spans" },
      { label: "Efficiency", value: "LEED Platinum & IGBC Zero Carbon Certified" },
      { label: "Ceiling Heights", value: "4.2m Floor-to-Slab Clearances" },
      { label: "Power", value: "100% Dual-Grid Redundant Backup" },
      { label: "Transit", value: "Direct Pedestrian Arterial Linkage" }
    ],
    specifications: {
      "HVAC": "Variable Refrigerant Flow (VRF) with ERV fresh air units",
      "Elevators": "8 High-speed destination-controlled passenger cabs",
      "Facade": "Unitized double-skin glass curtain wall with exterior fins",
      "Floor Load": "5.0 kN/sqm live load capacity for trading floors",
      "Parking": "3-level basement parking for 320 vehicles with EV charging"
    },
    isFeatured: true
  },
  {
    slug: "travertine-arcade-flagship",
    title: "The Travertine Arcade Flagship",
    tagline: "Double-height luxury retail arcade with monumental stone porticos.",
    category: "commercial",
    propertyType: "Luxury Retail Flagship",
    location: "Colaba Arts & Heritage Precinct, Mumbai",
    price: "Price on Application",
    area: "14,800 sq ft",
    yearBuilt: "2024",
    architect: "Heritage Modernity Studio",
    materials: ["Roman Travertine", "Brushed Bronze & Copper", "Crystal Display Glass", "Basalt Stone Paving"],
    image: "/images/property_comm_retail.jpg",
    gallery: [
      "/images/property_comm_retail.jpg",
      "/images/property_comm_hq.jpg"
    ],
    description: "Situated in the historic heart of South Mumbai, The Travertine Arcade provides an uncompromising stage for international luxury maisons. An exterior rhythm of hand-carved stone arches frames double-height shopfronts with custom copper profiles. Inside, a sculptural central helical staircase forms an unforgettable focal point.",
    highlights: [
      { label: "Frontage", value: "38m High-Visibility Street Frontage" },
      { label: "Volume", value: "7.4m Double-Height Showroom Levels" },
      { label: "Structure", value: "Historic Masonry Retrofitted with Steel Core" },
      { label: "Zoning", value: "Commercial Grade-A Retail Flagship" },
      { label: "Logistics", value: "Dedicated Rear Loading Bay & Valet Drop-off" }
    ],
    specifications: {
      "Glazing": "Low-iron anti-reflective museum-grade storefront glass",
      "Lighting": "Adjustable 98 CRI gallery-grade architectural luminaires",
      "Flooring": "Monolithic polished terrazzo and basalt thresholds",
      "Security": "Bank-grade vault integration and secure dispatch access"
    },
    isFeatured: false
  },
  {
    slug: "azure-coastal-peninsula",
    title: "Azure Coastal Peninsula Parcel",
    tagline: "18.4 acres of oceanfront cliffside land with approved private master plan.",
    category: "land",
    propertyType: "Coastal Development Parcel",
    location: "South Goa Escarpment",
    price: "₹65,00,00,000",
    area: "18.4 Acres (801,500 sq ft)",
    yearBuilt: "Ready for Development",
    architect: "Master Planned by Studio Architecture",
    materials: ["Natural Basalt Cliffs", "Coastal Alluvium", "Olive & Palm Canopy", "Spring Water Source"],
    image: "/images/property_land_aerial.jpg",
    gallery: [
      "/images/property_land_aerial.jpg",
      "/images/property_blueprint.jpg"
    ],
    blueprintImage: "/images/property_blueprint.jpg",
    description: "A rare geographic opportunity on the western coastline. The Azure Peninsula offers 420 meters of private cliff frontage commanding unobstructed 270-degree ocean views. The parcel features gentle terraced topography descending toward a secluded cove, making it primed for a low-density private architectural retreat or exclusive boutique villa development.",
    highlights: [
      { label: "Total Land Extent", value: "18.4 Contiguous Acres" },
      { label: "Water Frontage", value: "420m Direct Ocean Clifftop" },
      { label: "Title & Clearances", value: "100% Clear Freehold Title with CRZ NOC" },
      { label: "Topography", value: "Gradual 6% Slope with Natural Contours" },
      { label: "Access", value: "12m Asphalt Arterial Road Connection" },
      { label: "Utilities", value: "High-tension 11kV Grid and Aquifer Onsite" }
    ],
    specifications: {
      "Zoning": "Hospitality & Low-Density Residential Development Approved",
      "Survey Status": "Complete LiDAR Elevation & Soil Geotechnical Report Available",
      "Permissible FSI": "Up to 0.40 FSI with eco-sensitive low-footprint guidelines",
      "Ecological Status": "Zero mangrove impact, indigenous tree preservation easement"
    },
    isFeatured: true
  }
];
