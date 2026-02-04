# Project file structure 📁

Generated: 2026-02-04

Below is the full file/directory structure for this repository.

```
geoauth-backend/
├── .gitignore
├── LICENSE
├── README.md
├── docker-compose.yml
├── package.json
├── package-lock.json
├── prisma.config.ts
├── tsconfig.json
├── prisma/
│   ├── seed.ts
│   ├── schema.prisma
│   └── migrations/
│       ├── migration_lock.toml
│       └── 20260203064256_init/
│           └── migration.sql
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   └── env.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── geo.controller.ts
│   │   └── history.controller.ts
│   ├── docs/
│   │   ├── openapi.yaml
│   │   └── swagger.ts
│   ├── lib/
│   │   ├── ipinfo.ts
│   │   └── prisma.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── repositories/
│   │   ├── history.repo.ts
│   │   └── user.repo.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── geo.routes.ts
│   │   └── history.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── geo.service.ts
│   │   └── history.service.ts
│   ├── types/
│   │   └── express.d.ts
│   └── utils/
│       ├── ip.ts
│       ├── jwt.ts
│       ├── password.ts
│       └── validate.ts
```

---

If you'd like, I can:
- add this file to the repository (committed with a suggested commit message) ✅
- generate a more detailed README section for contributors or setup steps 💡
- output the tree in alternative formats (JSON, CSV) 🔧

Which next step do you want? — GitHub Copilot