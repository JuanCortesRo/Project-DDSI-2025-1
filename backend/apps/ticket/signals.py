from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import EmailMultiAlternatives
from email.mime.image import MIMEImage
from .models import Ticket  # Adjust to your actual Ticket model
import os

@receiver(post_save, sender=Ticket)
def send_ticket_created_email(sender, instance, created, **kwargs):
    if created:
        subject = '¡Solicitud de tiquete exitosa!'
        text_content = f'Hola {instance.user.first_name}, tu tiquete #{instance.id_ticket} ha sido creado.'
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Ticket Creado</title>
        </head>
        <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
            <td align="center" style="padding: 20px 0;">
                <!-- Banner with Logo -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 6px; overflow: hidden;">
                <tr>
                    <td align="center" style="background-color: #20243c; padding: 20px;">
                    <img src="cid:logo_image" alt="Qline logo" width="150" style="display: block;">
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding: 40px 30px 10px 30px;">
                    <h1 style="margin: 0; font-size: 28px; color: #333333;">Hola, {instance.user.first_name}!</h1>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding: 10px 30px 40px 30px;">
                    <p style="margin: 0; font-size: 16px; color: #666666;">
                    Tu tiquete <strong>#{instance.id_ticket}</strong> ha sido creado exitosamente<br>
                    Puedes consultar el estado de tu tiquete a traves del siguiente enlace
                    <br><br>
                    <a href="https://qline-frontend.onrender.com/ticket-status/{instance.id_ticket}">Consultar estado de mi tiquete</a>
                    <br><br>
                    Gracias por utilizar nuestros servicios
                    </p>
                    </td>
                </tr>
                </table>
            </td>
            </tr>
        </table>
        </body>
        </html>
        """

        msg = EmailMultiAlternatives(subject, text_content, None, [instance.user.email])
        msg.attach_alternative(html_content, "text/html")

        # Attach the image as inline (embedded)
        image_path = os.path.join(os.path.dirname(__file__), 'static', 'login-side.png')
        with open(image_path, 'rb') as img:
            mime_img = MIMEImage(img.read())
            mime_img.add_header('Content-ID', '<logo_image>')
            mime_img.add_header('Content-Disposition', 'inline', filename='login-side.png')
            msg.attach(mime_img)

        msg.send()