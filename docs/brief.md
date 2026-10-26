# Assignment brief: Café Roble

## Assignment

Create a responsive static landing page for Café Roble using the supplied content and Figma design reference.

Café Roble is the team's first test assignment. The team's architecture and operating rules are defined separately in `docs/team-spec.md`.

## Design reference

Status: pending.

Before implementation, provide:
- Figma reference URL.
- Target page or node, if applicable.

Inspect the reference through Figma MCP. If the reference cannot provide the necessary design context, report the limitation before implementing.

Use the brief as the source of truth for business facts, required content, and behavior. Use Figma as the source of truth for visual presentation.

If the two conflict, report the conflict rather than silently choosing one.

## Business context

Café Roble is a fictional neighborhood coffee shop in San José, Costa Rica.

It serves locally sourced coffee, pastries, and simple breakfast options. Its audience includes people who live or work nearby and want a comfortable place to take a break or meet a friend.

Brand personality: warm, approachable, and understated.

All business details in this brief are fictional.

## Visitor goal

Help visitors understand what Café Roble offers, find its opening hours, and locate the shop.

The primary call to action is “Cómo llegar.” It links to the location section on the same page.

## Content rules

- Write all visitor-facing content in Spanish.
- Use “tú” when addressing the visitor.
- Use the supplied copy.
- Do not invent awards, reviews, certifications, contact details, or additional business claims.
- Do not use placeholder text.
- Report missing content rather than fabricating facts.

## Required sections and copy

### Header

Text wordmark:
“Café Roble”

Navigation:
- “El menú” links to the menu section.
- “Visítanos” links to the location section.

Keep both links visible on mobile without a hamburger menu.

### Hero

Introductory label:
“CAFÉ DE BARRIO · SAN JOSÉ”

Main heading:
“Buen café. Una pausa para ti.”

Supporting text:
“Café de Costa Rica, repostería fresca y un espacio para disfrutar sin prisa.”

Primary CTA:
“Cómo llegar”

The CTA links to the location section.

### Featured menu

Heading:
“Algo rico para acompañar tu día”

Items:

| Item | Description | Price |
| --- | --- | --- |
| Café filtrado | Café de Costa Rica, preparado al momento. | ₡1.800 |
| Cappuccino | Espresso con leche y espuma suave. | ₡2.200 |
| Croissant de mantequilla | Horneado cada mañana. | ₡1.600 |

### About

Heading:
“Tu próxima pausa queda cerca”

Body:
“Somos una cafetería de barrio con café de origen local, repostería y opciones sencillas para desayunar. Un lugar cómodo para tomar un respiro o conversar con alguien.”

### Location and opening hours

Heading:
“Ven a visitarnos”

Address:
“200 metros al norte del Parque Central, San José, Costa Rica.”

Hours:
- Lunes a viernes: 7:00 a. m.–6:00 p. m.
- Sábado: 8:00 a. m.–4:00 p. m.
- Domingo: cerrado.

Display the address and hours directly as text.

Do not add an embedded map or link to a real business.

### Footer

Business name:
“Café Roble”

Visible notice:
“Cafetería ficticia. Sitio creado como ejercicio educativo.”

## Visual requirements

Follow the supplied Figma reference.

The intended direction is:
- Warm cream background.
- Dark espresso text.
- Muted forest-green accents.
- Clear typography and generous spacing.
- A decorative coffee illustration.
- No remote stock photography or external font dependency.

Keep all text selectable. Treat the illustration as decorative.

Do not add animation, carousels, parallax, or autoplay.

## Technical scope

Deliver:
- `index.html`
- `styles.css`
- Local assets if required.

Requirements:
- Semantic HTML and CSS.
- No application framework or build step for the landing page.
- No JavaScript required for the landing page.
- No external runtime services or remote assets.
- No backend, database, forms, authentication, ordering, reservations, or payments.
- No deployment or publishing.

The Node.js orchestrator and MCP connections belong to the tutorial system, not to the delivered landing page.

## Acceptance criteria

### Content and behavior

- [ ] Every required section is present.
- [ ] Copy, menu names, prices, address, and opening hours match this brief.
- [ ] Navigation links reach the correct sections.
- [ ] “Cómo llegar” reaches the location section.
- [ ] The fictional-business notice is visible.

### Visual implementation

- [ ] Layout, colors, typography, spacing, and illustration placement follow the Figma reference.
- [ ] Material differences from the reference are documented.
- [ ] At 1440 px, the hero uses the reference's desktop composition.
- [ ] At 375 px, content stacks naturally and navigation remains usable.
- [ ] Neither viewport has horizontal overflow or clipped content.

### Accessibility

- [ ] The page has a descriptive title and declares Spanish as its language.
- [ ] There is one H1 and a logical heading hierarchy.
- [ ] Navigation and actions use semantic links.
- [ ] Interactive elements are keyboard accessible and have visible focus indicators.
- [ ] Content remains readable and usable at 200% browser zoom.
- [ ] Normal text meets a contrast ratio of at least 4.5:1; large text meets at least 3:1.
- [ ] Decorative graphics are ignored by assistive technology.

### Technical verification

- [ ] The local preview loads successfully.
- [ ] No required local assets are missing.
- [ ] The page makes no unexpected external requests.
- [ ] Desktop and mobile browser screenshots are retained.
- [ ] Each criterion has a recorded result and supporting evidence or an explicit verification limitation.

These criteria define a limited accessibility review, not full WCAG conformance.

## Assignment completion

The assignment is ready for human review when all required checks pass with evidence.

Correction limits, execution records, and final workflow statuses follow `docs/team-spec.md`.