export const STORE_PERMISSIONS = [
    {
        resource: "store",
        action: "view",
        description: "View store information",
    },
    {
        resource: "store",
        action: "update",
        description: "Update store information",
    },

    {
        resource: "members",
        action: "view",
        description: "View store members",
    },
    {
        resource: "members",
        action: "create",
        description: "Add members to the store",
    },
    {
        resource: "members",
        action: "update",
        description: "Update store member information",
    },
    {
        resource: "members",
        action: "delete",
        description: "Remove members from the store",
    },

    {
        resource: "categories",
        action: "view",
        description: "View store categories",
    },
    {
        resource: "categories",
        action: "create",
        description: "Add categories to the store",
    },
    {
        resource: "categories",
        action: "update",
        description: "Update store member information",
    },
    {
        resource: "categories",
        action: "delete",
        description: "Remove categories from the store",
    },

    {
        resource: "roles",
        action: "view",
        description: "View store roles",
    },
    {
        resource: "roles",
        action: "create",
        description: "Create store roles",
    },
    {
        resource: "roles",
        action: "update",
        description: "Update store roles",
    },
    {
        resource: "roles",
        action: "delete",
        description: "Delete store roles",
    },

    {
        resource: "products",
        action: "view",
        description: "View store products",
    },
    {
        resource: "products",
        action: "create",
        description: "Create products",
    },
    {
        resource: "products",
        action: "update",
        description: "Update products",
    },
    {
        resource: "products",
        action: "delete",
        description: "Delete products",
    },

    {
        resource: "inventory",
        action: "view",
        description: "View inventory and stock levels",
    },
    {
        resource: "inventory",
        action: "adjust",
        description: "Adjust inventory and stock quantities",
    },

    {
        resource: "sales",
        action: "view",
        description: "View sales transactions",
    },
    {
        resource: "sales",
        action: "create",
        description: "Create sales transactions",
    },
    {
        resource: "sales",
        action: "update",
        description: "Update sales transactions",
    },
    {
        resource: "sales",
        action: "delete",
        description: "Delete sales transactions",
    },

    {
        resource: "purchases",
        action: "view",
        description: "View purchase transactions",
    },
    {
        resource: "purchases",
        action: "create",
        description: "Create purchase transactions",
    },
    {
        resource: "purchases",
        action: "update",
        description: "Update purchase transactions",
    },
    {
        resource: "purchases",
        action: "delete",
        description: "Delete purchase transactions",
    },

    {
        resource: "customers",
        action: "view",
        description: "View store customers",
    },
    {
        resource: "customers",
        action: "create",
        description: "Create customers",
    },
    {
        resource: "customers",
        action: "update",
        description: "Update customer information",
    },
    {
        resource: "customers",
        action: "delete",
        description: "Delete customers",
    },

    {
        resource: "customer_credit",
        action: "view",
        description: "View customer credit balances and credit history",
    },
    {
        resource: "customer_credit",
        action: "create",
        description: "Create customer credit transactions",
    },
    {
        resource: "customer_credit",
        action: "update",
        description: "Update customer credit transactions",
    },

    {
        resource: "expenses",
        action: "view",
        description: "View store expenses",
    },
    {
        resource: "expenses",
        action: "create",
        description: "Create store expenses",
    },
    {
        resource: "expenses",
        action: "update",
        description: "Update store expenses",
    },
    {
        resource: "expenses",
        action: "delete",
        description: "Delete store expenses",
    },

    {
        resource: "reports",
        action: "view",
        description: "View store reports",
    },
] as const;


export const DEFAULT_STAFF_PERMISSIONS = [
    {
        resource: "store",
        action: "view",
    },

    {
        resource: "products",
        action: "view",
    },

    {
        resource: "inventory",
        action: "view",
    },

    {
        resource: "sales",
        action: "view",
    },
    {
        resource: "sales",
        action: "create",
    },

    {
        resource: "purchases",
        action: "view",
    },

    {
        resource: "customers",
        action: "view",
    },
    {
        resource: "customers",
        action: "create",
    },

    {
        resource: "customer_credit",
        action: "view",
    },

    {
        resource: "expenses",
        action: "view",
    },

    {
        resource: "reports",
        action: "view",
    },
] as const;