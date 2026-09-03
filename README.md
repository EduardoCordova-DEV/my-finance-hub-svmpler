# My Finance Hub

Quiero que construyas **MyFinance**, una aplicación web de finanzas personales con diseño **mobile-first** (el 100% del diseño se piensa primero para pantalla de celular, con máximo 420px de ancho útil de contenido, aunque debe verse bien en desktop también).

### Concepto

MyFinance ayuda a las personas a tener finanzas saludables llevando control de sus ingresos, gastos fijos y gastos variables, mostrando su salud financiera de forma clara mediante gráficas simples.

### Dirección visual

Inspiración directa: **Copilot Money** (app de finanzas). Modo oscuro como tema principal (no uses tema claro por defecto). Estética limpia, minimalista, sin gradientes, sin sombras decorativas, sin bordes gruesos. La jerarquía visual se logra con distintos tonos de gris oscuro entre capas, no con líneas ni sombras.

**Paleta de colores (usar exactamente estos valores):**

```

Fondo base (pantalla):     #0B0B0D

Fondo de tarjeta:          #141416

Fondo de tarjeta elevada:  #1C1C1E

Borde sutil:               #2A2A28

Texto primario:            #F2F2F0

Texto secundario:          #9A9A94

Texto terciario/hints:     #7A7A74

Acento primario (CTA, progreso positivo): #1D9E75 (teal)

Acento secundario (info, links):          #378ADD (azul)

Colores de categoría (usar consistentemente, cada categoría de gasto siempre el mismo color):

- Vivienda/Renta:    #D4537E (rosa) — fondo tinte #4B1528

- Transporte:        #7F77DD (morado) — fondo tinte #26215C

- Comida/Despensa:   #EF9F27 (ámbar) — fondo tinte #412402

- Ocio/Entretenimiento: #5DCAA5 (teal claro) — fondo tinte #04342C

- Servicios (luz, agua, gas): #378ADD (azul) — fondo tinte #042C53

- Suscripciones:     #D85A30 (coral) — fondo tinte #4A1B0C

- Otros:             #888780 (gris) — fondo tinte #2C2C2A

Estados:

- Positivo/ahorro/ingreso: #639922 (verde)

- Negativo/alerta/sobregiro: #E24B4A (rojo)

- Advertencia: #EF9F27 (ámbar)

```

**Tipografía:** una fuente sans-serif nativa/del sistema (ej. Inter o system-ui). Los montos de dinero siempre en peso medio (500), nunca bold pesado. Jerarquía clara: el número más importante de cada pantalla (balance disponible) debe ser el elemento más grande, 28-32px.

**Componentes:**

- Tarjetas con esquinas redondeadas (16px), sin bordes visibles, diferenciadas solo por el tono de fondo

- Iconos tipo outline/lineales (no rellenos), simples, un color por categoría

- Botón principal flotante circular blanco con ícono "+" para agregar movimientos, siempre visible en la pantalla principal

- Barras de progreso delgadas (6px), esquinas redondeadas, color según el estado (verde si va bien, ámbar si se acerca al límite, rojo si se excede)

- Gráfica de dona para distribución de gastos por categoría, con leyenda a un costado (no debajo), mostrando color + nombre + porcentaje

### Flujo de usuario (en este orden exacto)

1. **Registro / Login** — opciones de email/contraseña, Google y Outlook (usa botones sociales estándar, no necesitas implementar OAuth real todavía, solo el flujo de UI)

2. **Pantalla de bienvenida** — mensaje corto de bienvenida tras el registro exitoso

3. **Formulario de ingresos** — el usuario elige si su ingreso es quincenal o mensual (selector tipo toggle/chips), luego captura el monto

4. **Formulario de gastos fijos** — tabla/lista editable donde el usuario agrega sus gastos fijos recurrentes: renta, luz, gas, agua, transporte, despensa, plan celular, suscripciones, y puede agregar categorías personalizadas. Cada gasto fijo tiene: nombre, categoría, monto, y opcionalmente día de pago

5. **Dashboard principal (Home)** — pantalla a la que el usuario llega después del onboarding y en cada sesión posterior

### Dashboard principal — contenido exacto

De arriba hacia abajo:

1. Saludo con nombre del usuario + avatar circular con iniciales

2. Tarjeta grande de "Disponible esta quincena/mes": monto grande, barra de progreso de cuánto del ingreso se ha usado, texto pequeño con % usado y días restantes del período

3. Dos tarjetas pequeñas lado a lado: total de gastos fijos y total de gastos variables del período

4. Tarjeta de "Por categoría": gráfica de dona + leyenda con las categorías donde más se gasta

5. Lista de "Movimientos recientes": últimos 5-6 gastos/ingresos, cada uno con ícono de categoría, nombre, fecha relativa (hoy, ayer) y monto

6. Botón flotante circular "+" para agregar un nuevo gasto o ingreso (al presionarlo, se abre un modal/bottom sheet)

### Modal "Agregar gasto/ingreso"

Bottom sheet que sube desde abajo (no modal centrado). Contiene:

- Selector tipo toggle entre "Gasto" e "Ingreso"

- Campo de monto grande y centrado como elemento principal

- Selector de categoría en grid de 2 columnas con chips (ícono + nombre), la categoría seleccionada se resalta con su color

- Campo de nota opcional

- Botón "Guardar" de ancho completo, fondo blanco, texto oscuro

### Pantallas adicionales a incluir

- **Historial de movimientos**: lista completa filtrable por categoría y por fecha

- **Categorías/Gastos fijos**: pantalla para editar los gastos fijos configurados en el onboarding

- **Perfil/Ajustes**: editar ingreso, cambiar tipo de periodo (quincenal/mensual), cerrar sesión

### Navegación

Barra de navegación inferior fija (tab bar), con 4 iconos: Home, Historial, Agregar (botón central destacado), Categorías, Perfil. Estilo minimalista, iconos outline, el ícono activo se resalta con el acento teal.

### Datos de ejemplo (mock data)

Usa datos de ejemplo realistas en pesos mexicanos (MXN) para poblar la interfaz: un usuario con ingreso quincenal de $8,500, gastos fijos típicos (renta $4,000, luz $350, gas $200, agua $150, transporte $800, despensa $1,200, plan celular $299, Netflix $199, Spotify $115), y 5-6 movimientos recientes de ejemplo.

### Requisitos técnicos

- Mobile-first, responsive, pero optimizado principalmente para viewport de celular (375-420px)

- Todos los montos con formato de moneda (separador de miles, 2 decimales)

- Estados vacíos con mensaje claro cuando no hay datos (ej. "Aún no tienes movimientos este período")

- Transiciones suaves pero sutiles, sin animaciones excesivas

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://my-finance-hub-svmpler.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/26133eda-af21-41a6-b4ed-2ea8a7c0721e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
