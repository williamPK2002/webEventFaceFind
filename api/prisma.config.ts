// Prisma config with schema path and database URL for migrations
export default {
  schema: 'prisma/schema.prisma',
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@postgres:5432/facesearch?schema=public&connection_limit=20&pool_timeout=30'
    }
  }
}
