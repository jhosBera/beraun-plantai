from django.contrib import admin
from .models import ChatSession, ChatMessage

class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ('role', 'content', 'sent_at')

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'crop', 'diagnosis', 'created_at', 'updated_at')
    list_filter = ('created_at',)
    search_fields = ('title', 'user__email')
    inlines = [ChatMessageInline]
