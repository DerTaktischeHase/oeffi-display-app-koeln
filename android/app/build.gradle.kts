plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val generatedWebAssets = layout.buildDirectory.dir("generated/webAssets")
val copyWebAssets by tasks.registering(Sync::class) {
    from(rootProject.projectDir.parentFile) {
        include("index.html", "stops.js")
    }
    into(generatedWebAssets)
}

android {
    namespace = "de.oeffimatrix.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "de.oeffimatrix.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    sourceSets.getByName("main").assets.srcDir(generatedWebAssets)
}

tasks.named("preBuild").configure {
    dependsOn(copyWebAssets)
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
}
