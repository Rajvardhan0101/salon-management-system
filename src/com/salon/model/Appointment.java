package com.salon.model;

/**
 * Appointment Entity
 * Represents booking reservations linking Customer, Stylist, and Service.
 */
public class Appointment {
    private int id;
    private String ref_code;
    private int customer_id;
    private String customer_name;
    private String customer_email;
    private String customer_phone;
    
    private Integer stylist_id;
    private String stylist_name;
    private String stylist_title;

    private int service_id;
    private String service_name;
    private int duration_mins;

    private String appointment_date;
    private String appointment_time;
    private String status;
    private String notes;
    private double total_price;
    private String payment_status;
    private String created_at;

    public Appointment() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getRefCode() { return ref_code; }
    public void setRefCode(String ref_code) { this.ref_code = ref_code; }

    public int getCustomerId() { return customer_id; }
    public void setCustomerId(int customer_id) { this.customer_id = customer_id; }

    public String getCustomerName() { return customer_name; }
    public void setCustomerName(String customer_name) { this.customer_name = customer_name; }

    public String getCustomerEmail() { return customer_email; }
    public void setCustomerEmail(String customer_email) { this.customer_email = customer_email; }

    public String getCustomerPhone() { return customer_phone; }
    public void setCustomerPhone(String customer_phone) { this.customer_phone = customer_phone; }

    public Integer getStylistId() { return stylist_id; }
    public void setStylistId(Integer stylist_id) { this.stylist_id = stylist_id; }

    public String getStylistName() { return stylist_name; }
    public void setStylistName(String stylist_name) { this.stylist_name = stylist_name; }

    public String getStylistTitle() { return stylist_title; }
    public void setStylistTitle(String stylist_title) { this.stylist_title = stylist_title; }

    public int getServiceId() { return service_id; }
    public void setServiceId(int service_id) { this.service_id = service_id; }

    public String getServiceName() { return service_name; }
    public void setServiceName(String service_name) { this.service_name = service_name; }

    public int getDurationMins() { return duration_mins; }
    public void setDurationMins(int duration_mins) { this.duration_mins = duration_mins; }

    public String getAppointmentDate() { return appointment_date; }
    public void setAppointmentDate(String appointment_date) { this.appointment_date = appointment_date; }

    public String getAppointmentTime() { return appointment_time; }
    public void setAppointmentTime(String appointment_time) { this.appointment_time = appointment_time; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public double getTotalPrice() { return total_price; }
    public void setTotalPrice(double total_price) { this.total_price = total_price; }

    public String getPaymentStatus() { return payment_status; }
    public void setPaymentStatus(String payment_status) { this.payment_status = payment_status; }

    public String getCreatedAt() { return created_at; }
    public void setCreatedAt(String created_at) { this.created_at = created_at; }
}
