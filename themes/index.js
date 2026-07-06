const themes = [
  {
    id: "basic-dark",
    name: "Basic Dark",
    path: "/themes/basic-dark/theme.css",
    colors: {
      surface: "#0f0f1a",
      text: "#f5f5f5",
      primary: "#db2777",
    },
  },
  {
    id: "basic-light",
    name: "Basic Light",
    path: "/themes/basic-light/theme.css",
    colors: {
      surface: "#ffffff",
      text: "#1a1a2e",
      primary: "#db2777",
    },
  },
];

export function getTheme(id) {
  return themes.find((t) => t.id === id) || themes[0];
}

export default themes;
