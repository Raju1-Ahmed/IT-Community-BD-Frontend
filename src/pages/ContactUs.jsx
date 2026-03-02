import { useState } from "react";
import api from "../api/client";

const ContactUs = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResponseMsg("");
    try {
      const { data } = await api.post("/contact", form);
      setResponseMsg(data.message || "Message sent successfully.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setResponseMsg(error?.response?.data?.message || "Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-3xl font-bold text-slate-900">Contact Us</h2>
      <p className="mt-2 text-slate-600">Send us your question, feedback, or support request.</p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <input
          className="w-full rounded-md border p-2"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Your Name"
          required
        />
        <input
          className="w-full rounded-md border p-2"
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="Your Email"
          required
        />
        <input
          className="w-full rounded-md border p-2"
          name="subject"
          value={form.subject}
          onChange={onChange}
          placeholder="Subject"
        />
        <textarea
          className="w-full rounded-md border p-2"
          rows="6"
          name="message"
          value={form.message}
          onChange={onChange}
          placeholder="Write your message"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-70"
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </form>

      {responseMsg ? <p className="mt-3 text-sm text-slate-700">{responseMsg}</p> : null}
    </section>
  );
};

export default ContactUs;
