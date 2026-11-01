package app.mg4dash.ui

import android.content.Context
import android.content.Intent
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import app.mg4dash.BuildConfig
import app.mg4dash.MainActivity
import app.mg4dash.apps.AppsActivity
import app.mg4dash.car.CarBridge
import app.mg4dash.car.VehicleState
import app.mg4dash.media.MediaHub
import app.mg4dash.pages.ClimateActivity
import app.mg4dash.pages.EnergyActivity
import app.mg4dash.pages.PhoneActivity
import app.mg4dash.pages.VehicleActivity
import app.mg4dash.settings.SettingsActivity
import kotlinx.coroutines.launch
import org.json.JSONObject

/** Couche de présentation de MainActivity. Les services véhicule et leurs commandes restent amont. */
class CustomHome(private val activity: MainActivity) {
    private var loaded = false
    private var latestState = VehicleState()
    private var latestMedia = MediaHub.NowPlaying()
    val view = WebView(activity).apply {
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.allowFileAccess = false
        settings.allowContentAccess = false
        settings.allowFileAccessFromFileURLs = false
        settings.allowUniversalAccessFromFileURLs = false
        settings.blockNetworkLoads = true
        webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest) = true
            override fun onPageFinished(view: WebView, url: String) {
                loaded = true
                publish()
            }
        }
        addJavascriptInterface(Bridge(), "MG4Preferences")
        loadUrl("file:///android_asset/mg4custom/index.html")
    }

    fun start() {
        activity.lifecycleScope.launch {
            activity.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch { CarBridge.state.collect { latestState = it; publish() } }
                launch { MediaHub.now.collect { latestMedia = it; publish() } }
            }
        }
    }

    private fun publish() {
        if (!loaded) return
        val s = latestState
        val connected = s.connected
        val data = JSONObject().apply {
            put("source", if (BuildConfig.MOCK) "simulator" else "vehicle")
            put("connected", connected)
            put("speedKmh", if (connected) s.speedKmh?.toInt() ?: JSONObject.NULL else JSONObject.NULL)
            put("batteryPercent", if (connected) s.batteryPercent ?: JSONObject.NULL else JSONObject.NULL)
            put("rangeKm", if (connected) s.rangeKm ?: JSONObject.NULL else JSONObject.NULL)
            put("onePedal", if (connected) s.onePedal ?: JSONObject.NULL else JSONObject.NULL)
            put("onePedalAvailable", JSONObject.NULL)
            put("gear", JSONObject.NULL)
            put("consumption", JSONObject.NULL)
            put("powerKw", JSONObject.NULL)
            put("haOnline", false)
            put("mediaTitle", latestMedia.title)
            put("mediaArtist", latestMedia.artist)
            put("mediaPlaying", latestMedia.playing)
            put("mediaAvailable", latestMedia.available)
        }
        view.evaluateJavascript("window.MG4Live && window.MG4Live.setState($data)", null)
    }

    fun close() {
        view.removeJavascriptInterface("MG4Preferences")
        view.destroy()
    }

    private inner class Bridge {
        private val prefs get() = activity.getSharedPreferences("mg4_custom_preferences", Context.MODE_PRIVATE)

        @JavascriptInterface fun getOnePedalPreferred() = prefs.getBoolean("onePedalPreferred", false)
        @JavascriptInterface fun setOnePedalPreferred(value: Boolean) {
            prefs.edit().putBoolean("onePedalPreferred", value).apply()
        }
        @JavascriptInterface fun openSettings() = open("settings")
        @JavascriptInterface fun open(page: String) {
            activity.runOnUiThread {
                val destination = when (page) {
                    "settings" -> SettingsActivity::class.java
                    "climate" -> ClimateActivity::class.java
                    "energy" -> EnergyActivity::class.java
                    "vehicle", "laneSettings" -> VehicleActivity::class.java
                    "phone" -> PhoneActivity::class.java
                    "apps", "navigation", "shortcuts" -> AppsActivity::class.java
                    else -> null
                }
                if (destination != null) activity.startActivity(Intent(activity, destination))
            }
        }
        @JavascriptInterface fun media(action: String) {
            activity.runOnUiThread {
                when (action) {
                    "playPause" -> MediaHub.playPause()
                    "next" -> MediaHub.next()
                    "previous" -> MediaHub.previous()
                }
            }
        }
    }
}
