const { PrismaClient } = require('@prisma/client');
const { Client } = require('minio');

const prisma = new PrismaClient();
const minioClient = new Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
  secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
});

async function cleanupOrphanedPhotos() {
  try {
    console.log('🔍 Checking for orphaned photos...\n');

    // Get all photos from database
    const photos = await prisma.photo.findMany({
      include: { faces: true }
    });

    console.log(`Found ${photos.length} photo(s) in database.`);
    
    const orphanedPhotos = [];

    // Check each photo if it exists in MinIO
    for (const photo of photos) {
      const filename = photo.storageUrl.split('/').pop();
      
      try {
        await minioClient.statObject('photos', filename);
        // File exists in MinIO - all good
      } catch (error) {
        if (error.code === 'NotFound') {
          // File doesn't exist in MinIO - orphaned!
          orphanedPhotos.push(photo);
          console.log(`❌ Orphaned: ${filename} (ID: ${photo.id})`);
        }
      }
    }

    if (orphanedPhotos.length > 0) {
      console.log(`\n⚠️  Found ${orphanedPhotos.length} orphaned photo(s).`);
      console.log('Deleting orphaned records from database...\n');
      
      for (const photo of orphanedPhotos) {
        // Delete associated faces first
        await prisma.face.deleteMany({
          where: { photoId: photo.id }
        });
        
        // Delete the photo
        await prisma.photo.delete({
          where: { id: photo.id }
        });
        
        console.log(`✓ Deleted ${photo.storageUrl.split('/').pop()}`);
      }
      
      console.log(`\n✅ Cleanup complete! Removed ${orphanedPhotos.length} orphaned photo(s).`);
    } else {
      console.log('\n✅ No orphaned photos found. Database is clean!');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedPhotos();
