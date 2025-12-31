Para desplegar el proyecto necesitas tener la última versión de Node y tener instalado `pnpm`.

Para instalar `pnpm` ejecuta este comando en la terminal:
```bash
npm install -g pnpm
```

Ahora para desplegar el proyecto primero tenemos que descargar las dependencias, construir el proyecto y inicializar este. Para ello ejecutaremos estos en este orden 
```bash
pnpm install # Instalar dependecias
pnpm build # Construit el proyecto
pnpm start # Inizalicar el proyecto
```

Después de ello accederemos a http://localhost:3000/ en el navegador y podremos utiliza la aplicación.