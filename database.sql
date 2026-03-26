-- =============================================
-- RentAPlace Database Schema
-- SQL Server Database Structure
-- =============================================

CREATE DATABASE RentAPlaceDb;
GO

USE RentAPlaceDb;
GO

-- =============================================
-- Table: Users
-- =============================================
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'Renter', -- 'Renter' or 'Owner'
    Phone NVARCHAR(20) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE UNIQUE INDEX IX_Users_Email ON Users(Email);

-- =============================================
-- Table: Categories
-- =============================================
CREATE TABLE Categories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500) NULL
);

-- =============================================
-- Table: Properties
-- =============================================
CREATE TABLE Properties (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000) NULL,
    Address NVARCHAR(300) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    Country NVARCHAR(100) NOT NULL,
    PricePerNight DECIMAL(18,2) NOT NULL,
    PropertyType NVARCHAR(50) NOT NULL DEFAULT 'Apartment', -- Flat, Villa, Apartment
    OwnerId INT NOT NULL,
    CategoryId INT NULL,
    Rating FLOAT NOT NULL DEFAULT 0,
    RatingCount INT NOT NULL DEFAULT 0,
    IsAvailable BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Properties_Users FOREIGN KEY (OwnerId) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Properties_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(Id) ON DELETE SET NULL
);

CREATE INDEX IX_Properties_OwnerId ON Properties(OwnerId);
CREATE INDEX IX_Properties_CategoryId ON Properties(CategoryId);
CREATE INDEX IX_Properties_City ON Properties(City);
CREATE INDEX IX_Properties_PropertyType ON Properties(PropertyType);

-- =============================================
-- Table: PropertyImages
-- =============================================
CREATE TABLE PropertyImages (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PropertyId INT NOT NULL,
    ImageUrl NVARCHAR(500) NOT NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CONSTRAINT FK_PropertyImages_Properties FOREIGN KEY (PropertyId) REFERENCES Properties(Id) ON DELETE CASCADE
);

CREATE INDEX IX_PropertyImages_PropertyId ON PropertyImages(PropertyId);

-- =============================================
-- Table: PropertyFeatures
-- =============================================
CREATE TABLE PropertyFeatures (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PropertyId INT NOT NULL,
    FeatureName NVARCHAR(100) NOT NULL, -- Pool, Beach-facing, Garden, Gym, Spa, WiFi, etc.
    CONSTRAINT FK_PropertyFeatures_Properties FOREIGN KEY (PropertyId) REFERENCES Properties(Id) ON DELETE CASCADE
);

CREATE INDEX IX_PropertyFeatures_PropertyId ON PropertyFeatures(PropertyId);

-- =============================================
-- Table: Reservations
-- =============================================
CREATE TABLE Reservations (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    PropertyId INT NOT NULL,
    UserId INT NOT NULL,
    CheckInDate DATETIME2 NOT NULL,
    CheckOutDate DATETIME2 NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Confirmed, Cancelled
    TotalPrice DECIMAL(18,2) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Reservations_Properties FOREIGN KEY (PropertyId) REFERENCES Properties(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Reservations_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE NO ACTION
);

CREATE INDEX IX_Reservations_PropertyId ON Reservations(PropertyId);
CREATE INDEX IX_Reservations_UserId ON Reservations(UserId);
CREATE INDEX IX_Reservations_Status ON Reservations(Status);

-- =============================================
-- Table: Messages
-- =============================================
CREATE TABLE Messages (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SenderId INT NOT NULL,
    ReceiverId INT NOT NULL,
    PropertyId INT NULL,
    Content NVARCHAR(2000) NOT NULL,
    SentAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    IsRead BIT NOT NULL DEFAULT 0,
    CONSTRAINT FK_Messages_Sender FOREIGN KEY (SenderId) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Messages_Receiver FOREIGN KEY (ReceiverId) REFERENCES Users(Id) ON DELETE NO ACTION,
    CONSTRAINT FK_Messages_Properties FOREIGN KEY (PropertyId) REFERENCES Properties(Id) ON DELETE SET NULL
);

CREATE INDEX IX_Messages_SenderId ON Messages(SenderId);
CREATE INDEX IX_Messages_ReceiverId ON Messages(ReceiverId);
CREATE INDEX IX_Messages_PropertyId ON Messages(PropertyId);

-- =============================================
-- Seed Data: Categories
-- =============================================


GO
