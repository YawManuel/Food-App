export type Category = {
  id: string;
  name: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageName: string;
  color: string;
  popular?: boolean;
  spicy?: boolean;
  prepTime: number;
};

export const CATEGORIES: Category[] = [
  { id: "all", name: "All" },
  { id: "rice", name: "Rice Dishes" },
  { id: "soups", name: "Soups" },
  { id: "grills", name: "Grills" },
  { id: "street", name: "Street Food" },
  { id: "drinks", name: "Drinks" },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "Jollof Rice",
    description:
      "Smoky, rich tomato rice cooked with aromatic spices, served with fried plantain and chicken.",
    price: 35,
    category: "rice",
    imageName: "jollof_rice",
    color: "#E8431A",
    popular: true,
    prepTime: 15,
  },
  {
    id: "2",
    name: "Waakye",
    description:
      "Traditional beans and rice cooked together, served with stew, spaghetti, and fresh shito.",
    price: 30,
    category: "rice",
    imageName: "waakye",
    color: "#8B4513",
    popular: true,
    prepTime: 20,
  },
  {
    id: "3",
    name: "Fried Rice & Chicken",
    description:
      "Seasoned fried rice with mixed vegetables, served alongside crispy grilled chicken.",
    price: 40,
    category: "rice",
    imageName: "fried_rice",
    color: "#D4A017",
    prepTime: 15,
  },
  {
    id: "4",
    name: "Light Soup (Goat)",
    description:
      "Thin, spicy pepper broth with tender goat meat, tomatoes, and garden eggs.",
    price: 45,
    category: "soups",
    imageName: "light_soup",
    color: "#FF6B35",
    spicy: true,
    prepTime: 25,
  },
  {
    id: "5",
    name: "Fufu & Groundnut Soup",
    description:
      "Smooth cassava fufu served with rich, creamy peanut soup and your choice of protein.",
    price: 50,
    category: "soups",
    imageName: "fufu",
    color: "#C68642",
    popular: true,
    prepTime: 30,
  },
  {
    id: "6",
    name: "Palm Nut Soup",
    description:
      "Thick, velvety palm nut soup with assorted meats, smoked fish, and fresh spices.",
    price: 48,
    category: "soups",
    imageName: "palm_nut_soup",
    color: "#CC4A1A",
    prepTime: 30,
  },
  {
    id: "7",
    name: "Kontomire Stew",
    description:
      "Nutritious cocoyam leaves stew with smoked fish and boiled eggs, served with boiled yam.",
    price: 35,
    category: "soups",
    imageName: "kontomire",
    color: "#2D6A4F",
    prepTime: 20,
  },
  {
    id: "8",
    name: "Grilled Tilapia",
    description:
      "Whole fresh tilapia marinated in spices and grilled to perfection, served with banku and pepper.",
    price: 65,
    category: "grills",
    imageName: "grilled_tilapia",
    color: "#5C4033",
    popular: true,
    spicy: true,
    prepTime: 25,
  },
  {
    id: "9",
    name: "Grilled Chicken",
    description:
      "Juicy whole chicken half seasoned with Ghanaian spices, charcoal grilled with jollof rice.",
    price: 55,
    category: "grills",
    imageName: "grilled_chicken",
    color: "#B5651D",
    prepTime: 30,
  },
  {
    id: "10",
    name: "Suya Skewers",
    description:
      "Spiced beef skewers grilled over an open flame, served with onions and tomatoes.",
    price: 45,
    category: "grills",
    imageName: "suya",
    color: "#8B3A1A",
    spicy: true,
    prepTime: 20,
  },
  {
    id: "11",
    name: "Kelewele",
    description:
      "Crispy fried ripe plantain chunks spiced with ginger, cloves, and chili — Ghana's iconic snack.",
    price: 20,
    category: "street",
    imageName: "kelewele",
    color: "#D4A017",
    popular: true,
    spicy: true,
    prepTime: 10,
  },
  {
    id: "12",
    name: "Koose",
    description:
      "Crunchy deep-fried black-eyed bean fritters — a beloved Ghanaian morning street snack.",
    price: 15,
    category: "street",
    imageName: "koose",
    color: "#C68642",
    prepTime: 10,
  },
  {
    id: "13",
    name: "Bofrot",
    description:
      "Soft, pillowy Ghanaian doughnuts fried golden, lightly sweetened and dusted with sugar.",
    price: 12,
    category: "street",
    imageName: "bofrot",
    color: "#D4A017",
    prepTime: 15,
  },
  {
    id: "14",
    name: "Meat Pie",
    description:
      "Flaky golden pastry filled with seasoned minced beef, carrots, and potatoes.",
    price: 18,
    category: "street",
    imageName: "meat_pie",
    color: "#A0522D",
    prepTime: 10,
  },
  {
    id: "15",
    name: "Sobolo",
    description:
      "Chilled hibiscus flower drink infused with ginger and spices — Ghana's signature refreshment.",
    price: 15,
    category: "drinks",
    imageName: "sobolo",
    color: "#9B1D3A",
    popular: true,
    prepTime: 2,
  },
  {
    id: "16",
    name: "Fresh Coconut Water",
    description:
      "Naturally refreshing coconut water straight from a young green coconut, iced cold.",
    price: 20,
    category: "drinks",
    imageName: "coconut_water",
    color: "#3A7D44",
    prepTime: 2,
  },
  {
    id: "17",
    name: "Malta Drink",
    description:
      "Smooth, malty non-alcoholic malt beverage — a classic Ghanaian favourite.",
    price: 12,
    category: "drinks",
    imageName: "malta",
    color: "#4A2C0A",
    prepTime: 2,
  },
];

export const IMAGE_MAP: Record<string, any> = {
  jollof_rice: require("../assets/images/jollof_rice.jpg"),
  waakye: require("../assets/images/waakye.jpg"),
  fried_rice: require("../assets/images/fried_rice.jpg"),
  light_soup: require("../assets/images/light_soup.jpg"),
  fufu: require("../assets/images/fufu.jpg"),
  palm_nut_soup: require("../assets/images/palm_nut_soup.jpg"),
  kontomire: require("../assets/images/kontomire.jpg"),
  grilled_tilapia: require("../assets/images/grilled_tilapia.jpg"),
  grilled_chicken: require("../assets/images/grilled_chicken.jpg"),
  suya: require("../assets/images/suya.jpg"),
  kelewele: require("../assets/images/kelewele.jpg"),
  koose: require("../assets/images/koose.jpg"),
  bofrot: require("../assets/images/bofrot.jpg"),
  meat_pie: require("../assets/images/meat_pie.jpg"),
  sobolo: require("../assets/images/sobolo.jpg"),
  coconut_water: require("../assets/images/coconut_water.jpg"),
  malta: require("../assets/images/malta.jpg"),
};
