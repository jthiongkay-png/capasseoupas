import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

const LAST_UPDATED = '20 février 2026';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Conditions d'utilisation",
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          headerBackTitle: 'Retour',
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lastUpdated}>Dernière mise à jour : {LAST_UPDATED}</Text>

        <Text style={styles.intro}>
          Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de l'application mobile Jamex (ci-après « l'Application »), éditée par Jamex (ci-après « l'Éditeur »).
        </Text>
        <Text style={styles.intro}>
          En téléchargeant, installant ou utilisant l'Application, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'Application.
        </Text>

        <Text style={styles.heading}>1. Objet de l'Application</Text>
        <Text style={styles.body}>
          Jamex est une application communautaire gratuite permettant aux utilisateurs de signaler et consulter les commerces et établissements en France qui acceptent ou refusent les cartes American Express (Amex). L'Application n'est pas affiliée à, ni sponsorisée par American Express Company ou l'une de ses filiales.
        </Text>

        <Text style={styles.heading}>2. Accès à l'Application</Text>
        <Text style={styles.body}>
          L'Application est accessible gratuitement à toute personne disposant d'un appareil compatible. L'Éditeur se réserve le droit de suspendre, modifier ou interrompre tout ou partie de l'Application sans préavis et sans que cela ne puisse donner lieu à une quelconque indemnisation.
        </Text>

        <Text style={styles.heading}>3. Contributions des utilisateurs</Text>
        <Text style={styles.body}>
          Les utilisateurs peuvent signaler des établissements et indiquer si leur carte Amex y a été acceptée ou refusée. En soumettant un signalement, vous déclarez que :
        </Text>
        <Text style={styles.bullet}>• L'information fournie est sincère et basée sur une expérience personnelle réelle.</Text>
        <Text style={styles.bullet}>• Vous n'utilisez pas l'Application à des fins de dénigrement, diffamation ou concurrence déloyale.</Text>
        <Text style={styles.bullet}>• Vous accordez à l'Éditeur une licence non exclusive, gratuite et mondiale d'utiliser, reproduire et afficher votre contribution dans le cadre de l'Application.</Text>

        <Text style={styles.heading}>4. Responsabilités de l'utilisateur</Text>
        <Text style={styles.body}>
          L'utilisateur s'engage à utiliser l'Application conformément à sa finalité et aux lois en vigueur, notamment :
        </Text>
        <Text style={styles.bullet}>• Ne pas soumettre de contenu illicite, injurieux, diffamatoire ou contraire aux bonnes mœurs.</Text>
        <Text style={styles.bullet}>• Ne pas tenter de porter atteinte au fonctionnement de l'Application (hacking, scraping, etc.).</Text>
        <Text style={styles.bullet}>• Ne pas collecter les données d'autres utilisateurs sans leur consentement.</Text>

        <Text style={styles.heading}>5. Limitation de responsabilité</Text>
        <Text style={styles.body}>
          Les informations affichées dans l'Application proviennent exclusivement des signalements de la communauté. L'Éditeur ne garantit pas l'exactitude, l'exhaustivité ou l'actualité de ces informations. En aucun cas l'Éditeur ne pourra être tenu responsable :
        </Text>
        <Text style={styles.bullet}>• De l'inexactitude ou de l'obsolescence des signalements.</Text>
        <Text style={styles.bullet}>• Du refus d'un moyen de paiement dans un établissement signalé comme l'acceptant.</Text>
        <Text style={styles.bullet}>• De tout dommage direct ou indirect résultant de l'utilisation de l'Application.</Text>

        <Text style={styles.heading}>6. Propriété intellectuelle</Text>
        <Text style={styles.body}>
          L'ensemble des éléments de l'Application (design, textes, logos, icônes, code source) sont protégés par le droit de la propriété intellectuelle. Toute reproduction, représentation ou exploitation non autorisée est interdite conformément aux articles L.335-2 et suivants du Code de la propriété intellectuelle.
        </Text>

        <Text style={styles.heading}>7. Données personnelles</Text>
        <Text style={styles.body}>
          Le traitement des données personnelles est régi par notre Politique de Confidentialité, conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée. Pour plus de détails, veuillez consulter notre Politique de Confidentialité accessible depuis l'Application.
        </Text>

        <Text style={styles.heading}>8. Modération du contenu</Text>
        <Text style={styles.body}>
          L'Éditeur se réserve le droit de supprimer, sans préavis, tout signalement ou contenu jugé inapproprié, inexact, trompeur ou contraire aux présentes CGU. Les utilisateurs peuvent signaler un contenu inapproprié via la fonction de contact de l'Application.
        </Text>

        <Text style={styles.heading}>9. Modification des CGU</Text>
        <Text style={styles.body}>
          L'Éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés des modifications substantielles via l'Application. La poursuite de l'utilisation de l'Application après modification vaut acceptation des nouvelles CGU.
        </Text>

        <Text style={styles.heading}>10. Droit applicable et juridiction</Text>
        <Text style={styles.body}>
          Les présentes CGU sont régies par le droit français. Conformément aux articles L.611-1 et suivants du Code de la consommation, en cas de litige, le consommateur peut recourir gratuitement à un médiateur de la consommation. À défaut de résolution amiable, tout litige sera soumis aux tribunaux compétents de Paris, France.
        </Text>

        <Text style={styles.heading}>11. Droit de rétractation</Text>
        <Text style={styles.body}>
          Conformément à l'article L.221-28 du Code de la consommation, l'Application étant un service numérique gratuit accessible immédiatement, le droit de rétractation ne s'applique pas.
        </Text>

        <Text style={styles.heading}>12. Contact</Text>
        <Text style={styles.body}>
          Pour toute question relative aux présentes CGU, vous pouvez nous contacter à l'adresse suivante : contact@jamex.app
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  lastUpdated: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
    marginBottom: 16,
  },
  intro: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 24,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  bullet: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 4,
    paddingLeft: 12,
  },
});
