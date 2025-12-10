-- CreateIndex
CREATE INDEX "abuse_reports_photoId_idx" ON "abuse_reports"("photoId");

-- CreateIndex
CREATE INDEX "abuse_reports_reporterId_idx" ON "abuse_reports"("reporterId");

-- CreateIndex
CREATE INDEX "abuse_reports_resolved_idx" ON "abuse_reports"("resolved");

-- CreateIndex
CREATE INDEX "deliveries_userId_idx" ON "deliveries"("userId");

-- CreateIndex
CREATE INDEX "deliveries_eventId_idx" ON "deliveries"("eventId");

-- CreateIndex
CREATE INDEX "deliveries_status_idx" ON "deliveries"("status");

-- CreateIndex
CREATE INDEX "faces_photoId_idx" ON "faces"("photoId");

-- CreateIndex
CREATE INDEX "faces_weaviateId_idx" ON "faces"("weaviateId");

-- CreateIndex
CREATE INDEX "photos_eventId_idx" ON "photos"("eventId");

-- CreateIndex
CREATE INDEX "photos_createdAt_idx" ON "photos"("createdAt");

-- CreateIndex
CREATE INDEX "photos_processingStatus_idx" ON "photos"("processingStatus");

-- CreateIndex
CREATE INDEX "removal_requests_photoId_idx" ON "removal_requests"("photoId");

-- CreateIndex
CREATE INDEX "removal_requests_userId_idx" ON "removal_requests"("userId");

-- CreateIndex
CREATE INDEX "removal_requests_status_idx" ON "removal_requests"("status");

-- CreateIndex
CREATE INDEX "saved_photos_userId_idx" ON "saved_photos"("userId");

-- CreateIndex
CREATE INDEX "saved_photos_photoId_idx" ON "saved_photos"("photoId");
