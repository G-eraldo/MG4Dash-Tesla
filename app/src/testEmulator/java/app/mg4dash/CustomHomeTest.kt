package app.mg4dash

import android.content.Context
import android.webkit.WebView
import android.widget.FrameLayout
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.Robolectric
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28], qualifiers = "w1920dp-h720dp-land-mdpi")
class CustomHomeTest {
    @Test fun mainActivityOpensTeslaHomeWithNativeMapLayer() {
        RuntimeEnvironment.getApplication().getSharedPreferences("mg4launcher", Context.MODE_PRIVATE)
            .edit().putInt("home_style", 3).commit()
        val controller = Robolectric.buildActivity(MainActivity::class.java).setup()
        val content = controller.get().findViewById<FrameLayout>(android.R.id.content)
        val home = content.getChildAt(0) as FrameLayout
        assertEquals(2, home.childCount)
        assertTrue(home.getChildAt(0) is WebView)
        assertTrue(home.getChildAt(1) is FrameLayout)
        controller.pause().stop().destroy()
    }
}
