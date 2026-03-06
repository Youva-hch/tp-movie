class ShoppingCart {
    private items: {
        id: string;
        name: string;
        price: number;
        quantity: number;
    }[] = [];

    // "Base de données" interne simulée
    private database: Record<string, any> = {};

    private taxRate: number = 0.2;

    addItem(id: string, name: string, price: number, quantity: number): void {
        if (quantity <= 0) {
            throw new Error("Quantity must be greater than 0");
        }

        this.items.push({ id, name, price, quantity });
    }

    removeItem(id: string): void {
        this.items = this.items.filter(item => item.id !== id);
    }

    calculateTotal(): number {
        let total = 0;

        for (const item of this.items) {
            total += item.price * item.quantity;
        }

        // Remise si total > 100
        if (total > 100) {
            total *= 0.9;
        }

        // TVA
        total += total * this.taxRate;

        return total;
    }

    checkout(userId: string): string {
        const total = this.calculateTotal();

        const orderId = `order_${Date.now()}`;

        // Persistance dictionnaire
        this.database[orderId] = {
            userId,
            items: this.items,
            total,
            createdAt: new Date().toISOString(),
            status: "paid"
        };

        // Reset panier
        this.items = [];

        return orderId;
    }

    getOrder(orderId: string): any {
        return this.database[orderId] ?? null;
    }

    listOrders(): Record<string, any> {
        return this.database;
    }
}
