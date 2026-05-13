export interface MenuItem {
  name: string;
  price: number | null; // null = po dogovoru / market price
  description?: string;
}

export interface MenuCategory {
  id: string;
  label: string;
  emoji: string;
  items: MenuItem[];
}

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: 'kava',
    label: 'Kava i topli napici',
    emoji: '☕',
    items: [
      { name: 'Espresso',          price: 1.70 },
      { name: 'Mali macchiato',    price: 1.80 },
      { name: 'Veliki macchiato',  price: 1.90 },
      { name: 'Dupli espresso',    price: 3.40 },
      { name: 'Nescafe instant',   price: 2.60 },
      { name: 'Bijela kava',       price: 2.10 },
      { name: 'Čaj',               price: 2.60 },
      { name: 'Kakao',             price: 2.60 },
    ],
  },
  {
    id: 'bezalkoholna',
    label: 'Bezalkoholna pića',
    emoji: '🥤',
    items: [
      { name: 'Coca-Cola 0.33 l',  price: 2.20 },
      { name: 'Fanta 0.33 l',      price: 2.20 },
      { name: 'Sprite 0.33 l',     price: 2.20 },
      { name: 'Nestea 0.5 l',      price: 2.50 },
      { name: 'Cedevita',          price: 1.80 },
      { name: 'Sok od naranče',    price: 2.00 },
      { name: 'Sok od jabuke',     price: 2.00 },
      { name: 'Multivitamin sok',  price: 2.00 },
      { name: 'Ledeni čaj',        price: 2.00 },
      { name: 'Energetski napitak',price: 3.00 },
      { name: 'Voda 0.33 l',       price: 1.20 },
      { name: 'Voda 0.5 l',        price: 2.20 },
      { name: 'Gazirana voda 0.5 l', price: 1.80 },
    ],
  },
  {
    id: 'pivo',
    label: 'Pivo',
    emoji: '🍺',
    items: [
      { name: 'Calsberg Točeno pivo 0.3 l', price: 1.80 },
      { name: 'Calsberg Točeno pivo 0.5 l', price: 2.80 },
      { name: 'Pan Točeno pivo 0.3 l', price: 1.80 },
      { name: 'Pan Točeno pivo 0.5 l', price: 2.80 },
      { name: 'Pan 0.5 l',  price: 2.50 },
      { name: 'Pan zlatni 0.5 l',     price: 2.50 },
      { name: 'Budweiser svijetli 0.5 l', price: 1.80 },
      { name: 'Budweiser tamni 0.5 l', price: 2.80 },
      { name: 'Heineken 0.33 l',   price: 3.00 },
      { name: 'Pivo bez alkohola 0.5 l', price: 2.50 },
    ],
  },
  {
    id: 'vino',
    label: 'Vino i žestoka pića',
    emoji: '🍷',
    items: [
      { name: 'Crno vino dl',      price: 1.80 },
      { name: 'Bijelo vino dl',    price: 1.80 },
      { name: 'Rosé vino dl',      price: 2.00 },
      { name: 'Šampanjac',         price: 4.00 },
      { name: 'Rakija (šljivovica)', price: 2.00 },
      { name: 'Rakija (travarica)', price: 2.00 },
      { name: 'Whiskey',           price: 4.00 },
      { name: 'Gin & Tonic',       price: 5.00 },
      { name: 'Aperol Spritz',     price: 5.50 },
    ],
  },
  {
    id: 'sladoled',
    label: 'Sladoled',
    emoji: '🍦',
    items: [
      { name: 'Macho', price: 1.20 },
      { name: 'Ledo medo', price: 2.00 },
      { name: 'Cedevita tuba',  price: 2.80 },
      { name: 'King', price: 3.00 },
      { name: 'Minions',  price: 2.50 },
      { name: 'Kontiki',  price: 3.00 },
      { name: 'Ledo kornet',  price: 3.00 },
      { name: 'Plazma sandwich',  price: 3.00 },
    ],
  },
];
