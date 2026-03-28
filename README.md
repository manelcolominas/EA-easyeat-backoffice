# MiniSpa

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.0.

## Structure

```
src/
├── environments/
│   └── environment.ts
├── main.ts
├── main.server.ts
│  
└── app/
    ├── app.ts
    ├── app.spec.ts
    ├── app.config.ts
    ├── app.config.server.ts
    ├── app.html
    ├── app.css
    ├── app.routes.ts
    ├── app.routes.server.ts
    │
    ├── models/
    │   ├── restaurant.model.ts
    │   └── customer.model.ts
    │
    ├── services/
    │   ├── restaurant.service.ts
    │   ├── restaurant.spec.ts
    │   ├── customer.service.ts
    │   └── customer.spec.ts
    │
    ├── restaurant-list/
    │   ├── restaurant-list.ts
    │   ├── restaurant-list.html
    │   ├── restaurant-list.css
    │   └── restaurant-list.spec.ts
    │
    ├── restaurant-list/
    │   ├── restaurant-list.ts
    │   ├── restaurant-list.html
    │   └── restaurant-list.css
    │
    └── confirm-dialog/
        ├── restaurant-list.ts
        ├── restaurant-list.html
        ├── restaurant-list.css
        └── restaurant-list.spec.ts
```

---

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

To generate a new interface (models), run:

```bash
ng generate interface interface-name
```

To generate a new service, run:

```bash
ng generate service service-name
```

To generate a new pipe, run:

```bash
ng generate pipe pipe-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.