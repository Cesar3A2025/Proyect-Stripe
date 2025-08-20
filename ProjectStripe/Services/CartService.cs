public class CartService
{
    private const string Key = "CART";
    private readonly IHttpContextAccessor _http;
    private ISession Session => _http.HttpContext!.Session;

    public CartService(IHttpContextAccessor http) => _http = http;

    public List<CartItem> Get()
    {
        var json = Session.GetString(Key);
        return string.IsNullOrWhiteSpace(json)
            ? new List<CartItem>()
            : System.Text.Json.JsonSerializer.Deserialize<List<CartItem>>(json)!;
    }

    private void Save(List<CartItem> items)
        => Session.SetString(Key, System.Text.Json.JsonSerializer.Serialize(items));

    public void Add(int productId, int qty = 1)
    {
        var items = Get();
        var item = items.FirstOrDefault(i => i.ProductId == productId);
        if (item == null) items.Add(new CartItem { ProductId = productId, Qty = qty });
        else item.Qty += qty;
        Save(items);
    }

    public void Remove(int productId)
    {
        var items = Get();
        items.RemoveAll(i => i.ProductId == productId);
        Save(items);
    }

    public void Clear() => Save(new List<CartItem>());
}
