package app.mg4dash.ui

import android.content.Context
import android.content.Intent
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.graphics.drawable.GradientDrawable
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import app.mg4dash.BuildConfig
import app.mg4dash.MainActivity
import app.mg4dash.apps.AppsActivity
import app.mg4dash.car.CarBridge
import app.mg4dash.car.CarProps
import app.mg4dash.car.VehicleState
import app.mg4dash.energy.ConsumptionCurve
import app.mg4dash.energy.ConsumptionEstimator
import app.mg4dash.energy.EnergyMonitor
import app.mg4dash.media.MediaHub
import app.mg4dash.map.LocationRepo
import app.mg4dash.map.MapCard
import app.mg4dash.map.NavRepo
import app.mg4dash.pages.ClimateActivity
import app.mg4dash.pages.EnergyActivity
import app.mg4dash.pages.PhoneActivity
import app.mg4dash.pages.VehicleActivity
import app.mg4dash.settings.SettingsActivity
import app.mg4dash.shortcuts.Shortcuts
import app.mg4dash.system.Apps
import app.mg4dash.system.Prefs
import app.mg4dash.system.Units
import android.content.ComponentName
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

/** Couche de présentation de MainActivity. Les services véhicule et leurs commandes restent amont. */
class CustomHome(private val activity: MainActivity) {
    private var loaded = false
    private var latestState = VehicleState()
    private var latestMedia = MediaHub.NowPlaying()
    private var latestPowerKw: Float? = null
    private val mapHolder = FrameLayout(activity).apply {
        visibility = View.GONE
        background = GradientDrawable().apply { cornerRadius = 20f }
        clipToOutline = true
    }
    private val mapCard = MapCard(activity, mapHolder)
    private var mapBounds: IntArray? = null
    private var hasLocation = false
    private val webView = WebView(activity).apply {
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
    val view = FrameLayout(activity).apply {
        addView(webView, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
        addView(mapHolder, FrameLayout.LayoutParams(0, 0))
    }

    fun start() {
        activity.lifecycleScope.launch {
            activity.repeatOnLifecycle(Lifecycle.State.STARTED) {
                launch { CarBridge.state.collect { latestState = it; publish() } }
                launch { MediaHub.now.collect { latestMedia = it; publish() } }
                launch { LocationRepo.location.collect { location ->
                    hasLocation = location != null
                    location?.let(mapCard::update)
                    showMap()
                } }
                launch { NavRepo.nav.collect { publish() } }
                launch {
                    while (true) {
                        latestPowerKw = withContext(Dispatchers.IO) {
                            val v = CarProps.getFloat(CarProps.BMS_PACK_VOL)
                            val a = CarProps.getFloat(CarProps.BMS_PACK_CRNT)
                            if (v != null && a != null && v in 100f..900f && a.isFinite()) v * a / 1000f else null
                        }
                        publish()
                        delay(2_000)
                    }
                }
            }
        }
    }

    private fun publish() {
        if (!loaded) return
        val s = latestState
        val connected = s.connected
        val period = Prefs(activity).consumptionPeriod.coerceIn(0, 2)
        val average = if (connected) ConsumptionEstimator.average.value?.let { Units.cons(activity, it) } else null
        val periodAverage = if (connected) EnergyMonitor.totals(period).per100?.let { Units.cons(activity, it) } else null
        val curve = if (connected) ConsumptionCard.curve(activity, period).first else emptyList()
        val nav = NavRepo.nav.value
        val shortcuts = JSONArray().apply {
            val prefs = Prefs(activity)
            repeat(8) { index ->
                val slot = Shortcuts.get(prefs, index)
                put(JSONObject().apply {
                    when (slot) {
                        Shortcuts.Slot.Empty -> { put("type", "empty"); put("label", "Ajouter") }
                        is Shortcuts.Slot.App -> { put("type", "app"); put("label", Shortcuts.appLabel(activity, slot.component)) }
                        is Shortcuts.Slot.Ha -> { put("type", "ha"); put("label", slot.label) }
                    }
                })
            }
        }
        val data = JSONObject().apply {
            put("source", if (BuildConfig.MOCK) "simulator" else "vehicle")
            put("connected", connected)
            put("speedKmh", if (connected) s.speedKmh?.let { Units.dist(activity, it).toInt() } ?: JSONObject.NULL else JSONObject.NULL)
            put("speedRawKmh", if (connected) s.speedKmh ?: JSONObject.NULL else JSONObject.NULL)
            put("batteryPercent", if (connected) s.batteryPercent ?: JSONObject.NULL else JSONObject.NULL)
            put("rangeKm", if (connected) s.rangeKm?.let { Units.dist(activity, it.toFloat()).toInt() } ?: JSONObject.NULL else JSONObject.NULL)
            put("onePedal", if (connected) s.onePedal ?: JSONObject.NULL else JSONObject.NULL)
            put("onePedalAvailable", JSONObject.NULL)
            put("gear", JSONObject.NULL)
            put("consumption", average ?: JSONObject.NULL)
            put("powerKw", if (connected) latestPowerKw ?: JSONObject.NULL else JSONObject.NULL)
            put("speedUnit", Units.speedUnit(activity))
            put("distanceUnit", Units.distUnit(activity))
            put("consumptionUnit", Units.consUnit(activity))
            put("driverTemp", if (connected) s.driverTemp ?: JSONObject.NULL else JSONObject.NULL)
            put("outsideTemp", if (connected) s.outsideTemp ?: JSONObject.NULL else JSONObject.NULL)
            put("hvacOn", if (connected) s.hvacOn ?: JSONObject.NULL else JSONObject.NULL)
            put("autoOn", if (connected) s.autoOn ?: JSONObject.NULL else JSONObject.NULL)
            put("acOn", if (connected) s.acOn ?: JSONObject.NULL else JSONObject.NULL)
            put("recirc", if (connected) s.recirc ?: JSONObject.NULL else JSONObject.NULL)
            put("fanSpeed", if (connected) s.fanSpeed ?: JSONObject.NULL else JSONObject.NULL)
            put("defrostFront", if (connected) s.defrostFront ?: JSONObject.NULL else JSONObject.NULL)
            put("defrostRear", if (connected) s.defrostRear ?: JSONObject.NULL else JSONObject.NULL)
            put("consumptionPeriod", period)
            put("periodAverage", periodAverage ?: JSONObject.NULL)
            put("consumptionCurve", JSONArray(curve))
            put("navDistanceMeters", nav?.distanceMeters ?: JSONObject.NULL)
            put("navRoad", nav?.let { it.road.ifBlank { it.actionText } } ?: JSONObject.NULL)
            put("navTotalMeters", nav?.totalMeters ?: JSONObject.NULL)
            put("navTotalSeconds", nav?.totalSeconds ?: JSONObject.NULL)
            put("navSide", nav?.side ?: JSONObject.NULL)
            put("shortcuts", shortcuts)
            put("haOnline", false)
            put("mediaTitle", latestMedia.title)
            put("mediaArtist", latestMedia.artist)
            put("mediaPlaying", latestMedia.playing)
            put("mediaAvailable", latestMedia.available)
            put("mediaProgress", if (latestMedia.durationMs > 0) (latestMedia.positionMs.toDouble() / latestMedia.durationMs * 100).coerceIn(0.0, 100.0) else JSONObject.NULL)
        }
        webView.evaluateJavascript("window.MG4Live && window.MG4Live.setState($data)", null)
    }

    private fun showMap() {
        val rect = mapBounds
        mapHolder.visibility = if (hasLocation && rect != null && rect[2] > 0 && rect[3] > 0 && mapCard.available) View.VISIBLE else View.GONE
    }

    fun onResume() = mapCard.onResume()
    fun onPause() = mapCard.onPause()

    fun close() {
        mapCard.onPause()
        webView.removeJavascriptInterface("MG4Preferences")
        webView.destroy()
    }

    private inner class Bridge {
        private val prefs get() = activity.getSharedPreferences("mg4_custom_preferences", Context.MODE_PRIVATE)

        @JavascriptInterface fun getOnePedalPreferred() = prefs.getBoolean("onePedalPreferred", false)
        @JavascriptInterface fun setOnePedalPreferred(value: Boolean) {
            prefs.edit().putBoolean("onePedalPreferred", value).apply()
        }
        @JavascriptInterface fun openSettings() = open("settings")
        @JavascriptInterface fun mapBounds(x: Int, y: Int, width: Int, height: Int) {
            activity.runOnUiThread {
                val maxWidth = view.width
                val maxHeight = view.height
                if (maxWidth <= 0 || maxHeight <= 0) return@runOnUiThread
                val left = x.coerceIn(0, maxWidth)
                val top = y.coerceIn(0, maxHeight)
                val right = (x.toLong() + width).coerceIn(left.toLong(), maxWidth.toLong()).toInt()
                val bottom = (y.toLong() + height).coerceIn(top.toLong(), maxHeight.toLong()).toInt()
                val rect = intArrayOf(left, top, right - left, bottom - top)
                if (!rect.contentEquals(mapBounds)) {
                    mapBounds = rect
                    mapHolder.layoutParams = FrameLayout.LayoutParams(rect[2], rect[3]).apply {
                        leftMargin = rect[0]; topMargin = rect[1]
                    }
                    showMap()
                }
            }
        }
        @JavascriptInterface fun open(page: String) {
            activity.runOnUiThread {
                val destination = when (page) {
                    "settings" -> SettingsActivity::class.java
                    "climate" -> ClimateActivity::class.java
                    "energy" -> EnergyActivity::class.java
                    "vehicle", "laneSettings" -> VehicleActivity::class.java
                    "phone" -> PhoneActivity::class.java
                    "apps", "shortcuts" -> AppsActivity::class.java
                    "sound" -> app.mg4dash.pages.SoundActivity::class.java
                    else -> null
                }
                if (destination != null) activity.startActivity(Intent(activity, destination))
                else if (page == "navigation") {
                    val chosen = Prefs(activity).mapApp?.let(ComponentName::unflattenFromString)
                    if (chosen != null) Shortcuts.launch(activity, chosen)
                    else activity.startActivity(Intent(activity, AppsActivity::class.java))
                } else if (page == "media") {
                    if (!MediaHub.openCarPlayNowPlaying()) {
                        val owner = MediaHub.ownerComponent()
                        if (owner != null) Apps.open(activity, owner, "Media") else Apps.open(activity, Apps.RADIO, "Radio")
                    }
                }
            }
        }
        @JavascriptInterface fun climate(action: String) {
            activity.runOnUiThread {
                val s = CarBridge.state.value
                if (!s.connected || s.hvacOn == null) return@runOnUiThread
                when (action) {
                    "power" -> CarBridge.togglePower()
                    "tempDown" -> if (s.driverTemp != null) CarBridge.stepTemp(-1)
                    "tempUp" -> if (s.driverTemp != null) CarBridge.stepTemp(1)
                    "auto" -> CarBridge.toggleAuto()
                    "ac" -> CarBridge.toggleAc()
                    "recirc" -> CarBridge.toggleRecirc()
                    "front" -> CarBridge.toggleDefrostFront()
                    "rear" -> CarBridge.toggleDefrostRear()
                    "fanUp" -> if (s.fanSpeed != null) CarBridge.stepFan(1)
                }
            }
        }
        @JavascriptInterface fun setConsumptionPeriod(period: Int) {
            if (period !in 0..2) return
            activity.runOnUiThread { Prefs(activity).consumptionPeriod = period; publish() }
        }
        @JavascriptInterface fun shortcut(index: Int) {
            if (index !in 0..7) return
            activity.runOnUiThread {
                when (val slot = Shortcuts.get(Prefs(activity), index)) {
                    Shortcuts.Slot.Empty -> Shortcuts.edit(activity, index) { publish() }
                    is Shortcuts.Slot.App -> Shortcuts.launch(activity, slot.component)
                    is Shortcuts.Slot.Ha -> Shortcuts.runHa(activity, slot)
                }
            }
        }
        @JavascriptInterface fun editShortcut(index: Int) {
            if (index !in 0..7) return
            activity.runOnUiThread { Shortcuts.edit(activity, index) { publish() } }
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
