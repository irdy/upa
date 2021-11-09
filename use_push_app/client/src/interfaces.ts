interface ContactRequestBody {
    contact_info: {
        name: string;
    },
    push_subscription: {
        sub_endpoint: string;
        user_agent: string;
    },
}

