from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import EmailMultiAlternatives, get_connection, EmailMessage
from email.mime.image import MIMEImage
from .models import User
import os

@receiver(post_save, sender=User)
def send_user_created_email(sender, instance, created, **kwargs):
    if created:
        subject = '¡Bienvenido a QLine!'
        if instance.role == User.CLIENTE:
            text_content = f'Hola {instance.first_name}'
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <title>Welcome Email</title>
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
                        <h1 style="margin: 0; font-size: 28px; color: #333333;">Hola, {instance.first_name}!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 10px 30px 40px 30px;">
                        <p style="margin: 0; font-size: 16px; color: #666666;">
                            Has sido registrad@ exitosamente en nuestro sistema.<br>
                            A partir de este momento puedes realizar tu solicitud de tiquetes en el siguiente enlace usando tu numero de identificacion<br>
                            <br>
                            <a href="https://qline-frontend.onrender.com/ticket-req">Solicita Tiquetes</a>.<br>
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
        else:
            text_content = f'Hola {instance.first_name}'
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <title>Welcome Email</title>
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
                        <h1 style="margin: 0; font-size: 28px; color: #333333;">Hola, {instance.first_name}!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 10px 30px 40px 30px;">
                        <p style="margin: 0; font-size: 16px; color: #666666;">
                            Has sido registrad@ exitosamente en nuestro sistema.<br>
                            Nos complace saber que ahora eres parte de nuestro staff, a continuacion encontraras tus credenciales con las cuales podras acceder al sistema<br>
                            <br>
                            Nombre de usuario: <strong>{instance.username}</strong><br>
                            Contraseña: <strong>{getattr(instance, '_plain_password', None)}</strong>
                            <br>
                            <br>
                            A partir de este momento puedes gestionar tiquetes accediendo al sistema desde el siguiente enlace<br>
                            <br>
                            <a href="https://qline-frontend.onrender.com/login">Gestiona Tiquetes
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

        msg = EmailMultiAlternatives(subject, text_content, None, [instance.email])
        msg.attach_alternative(html_content, "text/html")

        # Attach the image as inline (embedded)
        image_path = os.path.join(os.path.dirname(__file__), 'static', 'login-side.png')
        with open(image_path, 'rb') as img:
            mime_img = MIMEImage(img.read())
            mime_img.add_header('Content-ID', '<logo_image>')
            mime_img.add_header('Content-Disposition', 'inline', filename='login-side.png')
            msg.attach(mime_img)

        msg.send()