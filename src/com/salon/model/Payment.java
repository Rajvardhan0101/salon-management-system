package com.salon.model;

/**
 * Payment Entity
 * Records payments/invoices (Cash, UPI, Card, NetBanking).
 */
public class Payment {
    private int id;
    private int appointment_id;
    private String payment_method;
    private double amount;
    private String transaction_ref;
    private String payment_date;

    public Payment() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getAppointmentId() { return appointment_id; }
    public void setAppointmentId(int appointment_id) { this.appointment_id = appointment_id; }

    public String getPaymentMethod() { return payment_method; }
    public void setPaymentMethod(String payment_method) { this.payment_method = payment_method; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getTransactionRef() { return transaction_ref; }
    public void setTransactionRef(String transaction_ref) { this.transaction_ref = transaction_ref; }

    public String getPaymentDate() { return payment_date; }
    public void setPaymentDate(String payment_date) { this.payment_date = payment_date; }
}
