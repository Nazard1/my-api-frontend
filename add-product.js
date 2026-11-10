// Сторінка лише для авторизованих: гостя відправляємо на вхід із ?next=add-product.html.
requireAuth();

// Заповнити select варіантами з API (категорії чи бренди — публічні GET).
function fillSelect($select, items) {
  $.each(items, function(_, item) {
    $("<option>").val(item.id).text(item.name).appendTo($select);
  });
}

$(function() {
  const $form = $("#product-form");

  $.getJSON(API_URL + "/categories/").done(function(categories) {
    fillSelect($("#category"), categories);
  });
  $.getJSON(API_URL + "/brands/").done(function(brands) {
    fillSelect($("#brand"), brands);
  });

  $form.on("submit", function(event) {
    event.preventDefault();
    clearFormErrors($form);

    const data = {
      name: $("#name").val().trim(),
      description: $("#description").val().trim(),
      price: $("#price").val(),
      stock: $("#stock").val() || 0,
      // Не обрано — поле не надсилаємо (undefined JSON.stringify пропускає),
      // тоді бекенд відповість «Це поле обовʼязкове.».
      category: $("#category").val() || undefined,
      brand: $("#brand").val() || undefined
    };

    // apiRequest додає токен і сам оновлює його, якщо access прострочився.
    apiRequest({
        url: API_URL + "/products/",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(data)
      })
      .done(function() {
        location.href = "index.html";
      })
      .fail(function(xhr) {
        if (xhr.status !== 401) {
          showFormErrors($form, xhr);
        }
      });
  });
});