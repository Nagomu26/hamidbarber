# Your Barber — Web de reservas para barberías (React + Vite + Tailwind)

Landing de una página (oscuro y elegante) con reservas online en tiempo real contra
Google Sheets mediante un Google Apps Script. Lista para personalizar por barbería
y publicar en GitHub Pages o Cloudflare Pages.

## Para montar un cliente nuevo

Solo hay que tocar UN archivo y reconfigurar el Apps Script:

1. **Editar `src/lib/config.ts`**: nombre, logo, teléfono, WhatsApp, dirección,
   ciudad, zona, título SEO, NIF/CIF, correo, dominio público y clave anti-spam
   (`webhookToken`, cámbiala por cliente).
2. **Servicios y precios**: `src/data/services.ts`.
3. **Índices y señalética**: `src/data/services.ts`, horas y slots en `src/lib/booking.ts`.

### Conectar el Google Apps Script (reservas ↔ Google Sheets)

1. Copia TODO el contenido de `reservas-apps-script.gs` en el editor de Google
   Apps Script (ya incluye el guard anti-dobles y anti-spam).
2. Cambia la constante `WEBHOOK_TOKEN` por el mismo valor de `webhookToken` en
   `src/lib/config.ts`.
3. Implementar → Administrar implementaciones → Nueva versión → Implementar.
4. Ejecutar una vez `regenerarPlantillaLimpiando()` para dejar la hoja limpia.

### Publicar

- **GitHub Pages**: push a `main` (el workflow de `.github/workflows/deploy.yml`
  compila y publica). En Settings → Pages, fuente = **GitHub Actions**.
- **Cloudflare Pages**: `npm run build` y sube la carpeta `dist/`, o conecta el repo.

## Verificación local

```bash
npm install
npm run dev      # desarrollo
npm run build    # compila a dist/
npm run lint     # ESLint
```