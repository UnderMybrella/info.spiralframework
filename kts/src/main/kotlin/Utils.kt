
import org.w3c.dom.HTMLFormElement
import org.w3c.dom.HTMLInputElement
import org.w3c.dom.asList
import org.w3c.dom.get
import org.w3c.dom.url.URL
import kotlin.browser.document
import kotlin.browser.window

@JsName("initialiseForm")
fun initialiseForm(id: String) {
    println("Initialising form with id $id")

    val urlSearchParams = URL(window.location.href).searchParams

    (document.forms[id] as? HTMLFormElement)?.elements?.asList()?.forEach { element ->
        val input = element as? HTMLInputElement ?: return@forEach
        input.value = urlSearchParams.get(input.name) ?: return@forEach
        println("Set the value of ${input.name}")
    } ?: println("Failed to initialise $id")
}