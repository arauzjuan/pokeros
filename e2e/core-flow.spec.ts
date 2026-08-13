import { expect, type Browser, type Page, test } from "@playwright/test";

const password = "PokerOS-e2e-2026!";
const money = (amountPattern: string) => new RegExp(`(?:US\\$|USD|\\$)\\s*${amountPattern}`);

function adminConfig() {
  const url = process.env.E2E_SUPABASE_URL;
  const serviceRoleKey = process.env.E2E_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Definí E2E_SUPABASE_URL y E2E_SUPABASE_SERVICE_ROLE_KEY para confirmar y limpiar las cuentas E2E.");
  }
  return { url: url.replace(/\/$/, ""), serviceRoleKey };
}

async function adminRequest(path: string, init?: RequestInit) {
  const { url, serviceRoleKey } = adminConfig();
  const response = await fetch(`${url}/auth/v1/admin${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) throw new Error(`Supabase Admin respondió ${response.status}: ${await response.text()}`);
  return response;
}

async function findUser(email: string) {
  const response = await adminRequest(`/users?page=1&per_page=1000`);
  const payload = await response.json() as { users: Array<{ id: string; email?: string }> };
  return payload.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
}

async function createConfirmedUser(email: string) {
  await adminRequest("/users", {
    method: "POST",
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
}

async function deleteUser(email: string) {
  const user = await findUser(email);
  if (user) await adminRequest(`/users/${user.id}`, { method: "DELETE" });
}

async function createPlayer(page: Page, email: string, displayName: string, bankroll = "10000") {
  await page.goto("/signup");
  if (await page.getByRole("heading", { name: "Log in to Vercel" }).isVisible()) {
    throw new Error("La URL E2E está protegida por Vercel. Usá el dominio público de producción o un bypass token.");
  }
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByLabel("Confirmar contraseña").fill(password);
  await expect(page.getByRole("button", { name: "Crear cuenta" })).toBeEnabled();

  // Provisioning through Admin keeps this critical flow independent from the
  // external confirmation-email quota while the signup UI remains covered.
  await createConfirmedUser(email);
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page).toHaveURL(/\/onboarding(?:\?|$)/);
  await page.getByLabel("Nombre").fill(displayName);
  await page.getByLabel("País").fill("Argentina");
  await page.getByLabel("Moneda principal").selectOption("USD");
  await page.getByLabel("Tipo principal").selectOption("mtt");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page).toHaveURL(/\/onboarding\/bankroll/);
  await page.getByLabel("Bankroll actual").fill(bankroll);
  await page.getByLabel("Moneda").selectOption("USD");
  await page.getByRole("button", { name: "Finalizar configuración" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function registerTournament(page: Page, values: {
  name: string;
  buyIn: string;
  prize: string;
  position?: string;
  fieldSize?: string;
}) {
  await page.goto("/tournaments/new");
  await page.getByLabel("Nombre").fill(values.name);
  await page.getByLabel("Plataforma").selectOption("pokerstars");
  await page.getByLabel("Modalidad").selectOption("mtt");
  await page.getByLabel("Buy-in").fill(values.buyIn);
  await page.getByLabel("Premio").fill(values.prize);
  if (values.position) await page.getByLabel("Posición").fill(values.position);
  if (values.fieldSize) await page.getByLabel("Field size").fill(values.fieldSize);
  await page.getByRole("button", { name: "Guardar resultado" }).click();
  await expect(page).toHaveURL(/\/tournaments\?created=1/);
  await expect(page.getByRole("status")).toContainText("bankroll se actualizó");
}

async function expectBankroll(page: Page, amount: string) {
  await page.goto("/bankroll");
  const card = page.getByText("Bankroll actual", { exact: true }).locator("xpath=ancestor::*[@data-slot='card'][1]");
  await expect(card).toContainText(money(amount));
}

async function newIsolatedPlayer(browser: Browser, email: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await createPlayer(page, email, "Jugador aislado", "1000");
  return { context, page };
}

test("circuito completo de PokerOS Core v0.1", async ({ page, browser }) => {
  test.setTimeout(180_000);
  adminConfig();
  const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const primaryEmail = `arauzjuann+core-${runId}@gmail.com`;
  const secondaryEmail = `arauzjuann+isolated-${runId}@gmail.com`;
  const firstTournament = `E2E Sin premio ${runId}`;
  const secondTournament = `E2E Ganador ${runId}`;

  try {
    await test.step("crear cuenta, completar perfil e iniciar bankroll", async () => {
      await createPlayer(page, primaryEmail, "Jugador E2E");
      await expectBankroll(page, "10[.]?000[.,]00");
    });

  await test.step("registrar un torneo de USD 100 sin premio", async () => {
    await registerTournament(page, { name: firstTournament, buyIn: "100", prize: "0", position: "100", fieldSize: "100" });
    await expectBankroll(page, "9[.]?900[.,]00");
  });

  let secondTournamentPath = "";
  await test.step("registrar un torneo de USD 200 con USD 1.000 de premio", async () => {
    await registerTournament(page, { name: secondTournament, buyIn: "200", prize: "1000", position: "1", fieldSize: "100" });
    await Promise.all([
      page.waitForURL(/\/tournaments\/[^/?]+$/),
      page.getByRole("link", { name: secondTournament }).click(),
    ]);
    secondTournamentPath = new URL(page.url()).pathname;
    await expect(page.getByText("Profit neto").locator("..")).toContainText(money("800[.,]00"));
    await expectBankroll(page, "10[.]?700[.,]00");
  });

  await test.step("verificar dashboard, historial y métricas agregadas", async () => {
    await page.goto("/dashboard");
    const expectedKpis = [
      ["Bankroll total", money("10[.,]?700")],
      ["Ganancia total", money("700")],
      ["ROI", /233[.,]3%/],
      ["ABI", money("150[.,]00")],
      ["Torneos", /Torneos\s*2\s*Todo el historial/],
      ["ITM", /50[.,]0%/],
    ] as const;
    const kpiCards = page.locator("[data-slot='card']").filter({ hasText: /Todo el historial|Saldo actual/ });
    for (const [label, value] of expectedKpis) {
      await expect(kpiCards.filter({ has: page.getByText(label, { exact: true }) })).toContainText(value);
    }
    await expect(page.getByText("Resultados recientes", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: firstTournament })).toBeVisible();
    await expect(page.getByRole("link", { name: secondTournament })).toBeVisible();

    await page.getByRole("link", { name: "Ver todos" }).click();
    await expect(page).toHaveURL(/\/tournaments$/);
    await expect(page.getByRole("row", { name: new RegExp(secondTournament) })).toContainText(money("1[.]?000[.,]00"));
  });

  await test.step("editar el premio y recalcular bankroll", async () => {
    await page.goto(secondTournamentPath);
    await page.getByRole("link", { name: "Editar" }).click();
    await page.getByLabel("Premio").fill("1200");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByRole("status")).toContainText("bankroll se actualizaron");
    await expect(page.getByText("Profit neto").locator("..")).toContainText(money("1[.]?000[.,]00"));
    await expectBankroll(page, "10[.]?900[.,]00");
  });

  await test.step("impedir que otro usuario vea o edite el torneo", async () => {
    const isolated = await newIsolatedPlayer(browser, secondaryEmail);
    await isolated.page.goto(secondTournamentPath);
    await expect(isolated.page.getByText(/404|página no encontrada|not found/i)).toBeVisible();
    await isolated.page.goto(`${secondTournamentPath}/edit`);
    await expect(isolated.page.getByText(/404|página no encontrada|not found/i)).toBeVisible();
    await isolated.context.close();
  });

  await test.step("eliminar el primer torneo y dejar el bankroll en USD 11.000", async () => {
    await page.goto("/tournaments");
    await page.getByRole("link", { name: firstTournament }).click();
    await page.getByRole("button", { name: "Eliminar" }).click();
    await page.getByRole("button", { name: "Sí, eliminar resultado" }).click();
    await expect(page).toHaveURL(/\/tournaments\?deleted=1/);
    await expect(page.getByRole("status")).toContainText("se eliminaron correctamente");
    await expect(page.getByRole("link", { name: firstTournament })).toHaveCount(0);
    await expectBankroll(page, "11[.]?000[.,]00");
  });
  } finally {
    await deleteUser(primaryEmail);
    await deleteUser(secondaryEmail);
  }
});
