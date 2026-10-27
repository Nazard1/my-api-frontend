// Адреса бекенду (Django REST API).
const API_URL = "http://127.0.0.1:8000/api/v1";

const ERROR_MESSAGE =
  "Не вдалося отримати дані з API. Перевірте, що бекенд запущено на http://127.0.0.1:8000";

// Показати повідомлення над таблицею (isError — червоне оформлення).
function showStatus(text, isError) {
  $("#status").text(text).toggleClass("error", isError).prop("hidden", false);
}

// Створити рядок таблиці для одного товару.
// .text() вставляє дані як текст, а не HTML, — захист від XSS.
function productRow(product) {
  return $("<tr>").append(
    $("<td>").text(product.name),
    $("<td>").text(product.brand_name),
    $("<td>").text(product.category_name),
    $("<td>").addClass("num").text(product.price + " грн"),
    $("<td>").addClass("num").text(product.stock)
  );
}

// Виконується, коли сторінка завантажилась.
$(function() {
  // GET-запит до API; браузер пустить відповідь лише якщо бекенд дозволив наш origin (CORS).
  $.getJSON(API_URL + "/products/")
    .done(function(products) {
      if (products.length === 0) {
        showStatus("Товарів поки немає", false);
        return;
      }
      $("#products tbody").append(products.map(productRow));
      $("#status").prop("hidden", true);
      $("#products").prop("hidden", false);
    })
    // Бекенд не запущено, помилка CORS або сервер повернув помилку.
    .fail(function() {
      showStatus(ERROR_MESSAGE, true);
    });
});