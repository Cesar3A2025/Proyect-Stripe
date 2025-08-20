public class CatalogService
{
    private readonly List<Product> _products = new()
    {
        new Product(1, "Laptop", 1999, "usd"),
        new Product(2, "Auriculares", 6999, "usd"),
        new Product(3, "Teclado", 12999, "usd")
    };

    public IEnumerable<Product> All() => _products;
    public Product? Find(int id) => _products.FirstOrDefault(p => p.Id == id);
}
