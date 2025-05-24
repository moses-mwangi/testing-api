declare module "paystack" {
  interface Customer {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  }

  interface CustomField {
    display_name: string;
    variable_name: string;
    value: string;
  }

  interface Metadata {
    custom_fields?: CustomField[];
    [key: string]: any;
  }

  interface InitializeTransactionArgs {
    email: string;
    amount: number;
    reference?: string;
    callback_url?: string;
    currency?: string;
    channels?: string[];
    metadata?: Metadata;
    customer?: Customer;
    subaccount?: string;
    transaction_charge?: number;
    bearer?: "account" | "subaccount";
  }

  interface TransactionData {
    id: number;
    domain: string;
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    gateway_response: string;
    channel: "card" | "bank" | "ussd" | "qr" | "mobile_money" | "bank_transfer";
    currency: string;
    ip_address?: string;
    metadata: Metadata & {
      order_id?: string;
      transaction_id?: string;
    };
    log?: {
      time_spent: number;
      attempts: number;
      authentication?: string;
      errors: number;
      success: boolean;
      mobile: boolean;
      input: any[];
      channel?: string;
      history: Array<{
        type: string;
        message: string;
        time: number;
      }>;
    };
    fees?: number;
    authorization?: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name?: string;
    };
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata?: Metadata;
      risk_action: string;
    };
    plan?: any;
    paid_at: string;
    created_at: string;
    transaction_date?: string;
  }

  interface InitializeTransactionResponse {
    status: boolean;
    message: string;
    data: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  }

  interface VerifyTransactionResponse {
    status: boolean;
    message: string;
    data: TransactionData;
  }

  interface ListTransactionsResponse {
    status: boolean;
    message: string;
    data: TransactionData[];
    meta: {
      total: number;
      skipped: number;
      perPage: number;
      page: number;
      pageCount: number;
    };
  }

  interface Paystack {
    transaction: {
      initialize(
        args: InitializeTransactionArgs
      ): Promise<InitializeTransactionResponse>;
      verify(reference: string): Promise<VerifyTransactionResponse>;
      list(query?: {
        perPage?: number;
        page?: number;
        customer?: number;
        status?: string;
        from?: string;
        to?: string;
        amount?: number;
      }): Promise<ListTransactionsResponse>;
    };
    // Add other Paystack API endpoints as needed
  }

  const paystack: (secretKey: string) => Paystack;
  export default paystack;
}
