# Pruebas end-to-end

El flujo crítico crea dos cuentas reales y las elimina al terminar. Para ejecutarlo contra producción, configurá estas variables en `.env.local`:

```dotenv
PLAYWRIGHT_BASE_URL=https://pokeros-murex.vercel.app
E2E_SUPABASE_URL=https://<project-ref>.supabase.co
E2E_SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

La clave `service_role` se utiliza únicamente desde el proceso de Playwright para confirmar y limpiar usuarios. Nunca se envía al navegador ni debe versionarse.

```bash
pnpm test:e2e
```

El escenario valida registro, onboarding, bankroll inicial, alta/edición/borrado de resultados, KPIs, dashboard, historial y aislamiento entre usuarios.
